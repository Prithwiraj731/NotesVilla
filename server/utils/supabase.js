const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwkmbptvbpqxcnwarwii.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a21icHR2YnBxeGNud2Fyd2lpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyMDgyMCwiZXhwIjoyMDk5MDk2ODIwfQ.T2Ewnr1Nk_-9IQNNbxYz-65022PBTlSaxKfVTN-sW8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
