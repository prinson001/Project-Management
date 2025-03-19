import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; // Ensure this is set in your .env file
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY; // Ensure this is set in your .env file

// Create a Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);