// supabase-client.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://mtxcxbcoteejpgbhehfu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eGN4YmNvdGVlanBnYmhlaGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjY4MjQsImV4cCI6MjA2MzY0MjgyNH0.Zi7TnKYSKxwzequl7xF3G_R4giSz0Dw0K6wKPZGqfZs"; // your anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
