import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kxyoayirtfroywgbecwx.supabase.co";
const supabaseAnonKey = "YOUR_ANON_KEY"; // This should be replaced with your actual key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);