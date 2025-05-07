
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCheck, Users, Clock } from "lucide-react";

export const UserStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    averageSessionTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: totalUsers, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        // Get active users (users who logged in within the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: activeUsersData, error: activeError } = await supabase
          .from('user_sessions')
          .select('user_id')
          .gte('last_active', sevenDaysAgo.toISOString())
          .limit(1000);
        
        if (activeError) throw activeError;
        
        // Count unique users
        const uniqueActiveUsers = new Set();
        activeUsersData?.forEach(session => {
          if (session.user_id) uniqueActiveUsers.add(session.user_id);
        });
        
        // Get new users today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: newUsersData, error: newUsersError } = await supabase
          .from('profiles')
          .select('id')
          .gte('created_at', today.toISOString());
        
        if (newUsersError) throw newUsersError;
        
        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: uniqueActiveUsers.size,
          newUsersToday: newUsersData?.length || 0,
          averageSessionTime: 25 // Placeholder value in minutes
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, description = "" }) => (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-semibold">{value}</h3>
            {description && <p className="ml-2 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="rounded-full bg-violet-100 p-3">
          <Icon className="h-6 w-6 text-violet-600" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers} 
        icon={Users} 
      />
      <StatCard 
        title="Active Users" 
        value={stats.activeUsers} 
        icon={UserCheck} 
        description="Last 7 days"
      />
      <StatCard 
        title="New Users" 
        value={stats.newUsersToday} 
        icon={User} 
        description="Today"
      />
      <StatCard 
        title="Avg. Session" 
        value={stats.averageSessionTime} 
        icon={Clock} 
        description="minutes"
      />
    </div>
  );
};
