import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  // Use service role key for server-side operations

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, res) {
    const { data: {userID} } = await supabase.auth.getUser(request.handlers.authorization);

    if (!userID) {
        return res.status(401).json({ error: "Unauthorized" });
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

            response.status(200).json(data.settings || {});

        }
        catch (error) {
            response.status(500).json({ error: error.message });
        }
    }
    else {
        response.setHeader('Allow', ['GET', 'PUT']);
        response.status(405).end(`Method ${request.method} Not Allowed`);
    }
}