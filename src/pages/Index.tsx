import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");

  // Get current user's profile
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return user;
      }
      return null;
    },
  });

  // Get total number of products instead of users
  const { data: productCount, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["productCount"],
    queryFn: async () => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Get recent file history instead of activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("file_history")
        .select("*")
        .order("uploaded_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };
    setGreeting(getGreeting());

    // Set username from email if available
    if (currentUser) {
      setUserName(currentUser.email?.split("@")[0] || "");
    }
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {greeting}, {userName}!
        </h2>
        <div className="flex items-center gap-4">
          <Button>Quick Action</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{productCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{activity.file_type}</p>
                      <p className="text-muted-foreground">
                        {new Date(activity.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}