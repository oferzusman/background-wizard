import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kxyoayirtfroywgbecwx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW9heWlydGZyb3l3Z2JlY3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MzIwMDgsImV4cCI6MjA1MTQwODAwOH0.gccLt0BQ74G1xeYB1r3uiMKP-IOzHK0RXqbJm1Y8i_c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);