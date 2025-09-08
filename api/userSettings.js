import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  // Use service role key for server-side operations

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, res) {
    const token = request.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
        return res.status(401).json({ error: "No auth token found!" });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
        return res.status(401).json({ error: "Unauthorized!" });
    }

    if (request.method == 'GET') {
        /* Fetching user settings from Supabase */
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('settings')
                .eq('user_id', userID)
                .single();

            if (error) {
                throw error;
            }

            res.status(200).json(data.settings || {});

        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${request.method} Not Allowed`);
    }
}