const supa = require("@supabase/supabase-js");

// Replace with your Supabase project details
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = supa.createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
