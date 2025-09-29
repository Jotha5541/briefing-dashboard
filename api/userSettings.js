import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  // Use service role key for server-side operations

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, res) {
    const token = request.headers.authorization?.split(' ')[1];  // Extract token from header

    if (!token) {
        return res.status(401).json({ error: "No auth token found!" });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {   // No user found
        return res.status(401).json({ error: "Unauthorized!" });
    }

    try {
        if (request.method === 'GET') {
            /* Fetching user settings from Supabase */
            const { data, error } = await supabase
                .from('user_settings')
                .select('settings')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows found" error

            return res.status(200).json({ settings: data?.settings || {} });
        }

        if (request.method === 'PUT') {
            /* Updating user settings in Supabase */
            const { data, error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    settings: request.body,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error; 

            return res.status(200).json({ settings: data.settings });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`Method ${request.method} Not Allowed`);
    }
    catch (err) {
        console.error('userSettings API error:', err);
        return res.status(500).json({ error: err.message });
    }
}