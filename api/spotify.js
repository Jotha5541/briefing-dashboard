import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, res) {

    const tokenUrl = 'https://accounts.spotify.com/api/token';

    try {
        if (request.method === 'POST' && request.body.code && request.body.user_id) {   // Initial login handler
            /* Code exchange for tokens */
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + 
                        ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: request.body.code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                }), 
            });
            
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error_description || "Failed to get token");

            /* Store refresh token in Supabase */
            const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

            await supabase.from('spotify_tokens').upsert({
                user_id: request.body.user_id,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: expiresAt,
            });

            return res.status(200).json({ success: true});
        }

        if (request.method === 'GET' && request.query.user_id) {  // Token refresh handler
            const { data: tokenRow, error } = await supabase
                .from('spotify_tokens')
                .select('*')
                .eq('user_id', request.query.user_id)
                .single();

            if (error || !tokenRow) throw new Error("No tokens found for user");

            const isExpired = new Date(tokenRow.expires_at) <= new Date();
            if (!isExpired) return res.status(200).json({ access_token: tokenRow.access_token });


            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + 
                        ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
                },
                    body: new URLSearchParams({
                        grant_type: "refresh_token",
                        refresh_token: tokenRow.refresh_token,
                    }),
            });
            
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error_description || "Failed to refresh token");

            const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

            await supabase
                .from('spotify_tokens')
                .update({
                    access_token: data.access_token,
                    expires_at: expiresAt,
                })
                .eq("user_id", request.query.user_id);

            return res.status(200).json({ access_token: data.access_token });
        }

        return res.status(405).json({ error: "Method not allowed" });

    } catch (error) {
        return res.status(502).json({ error: error.message });
    }
}
