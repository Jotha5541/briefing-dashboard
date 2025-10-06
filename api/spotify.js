import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tokenUrl = 'https://accounts.spotify.com/api/token';

const clientAuth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString('base64');

export default async function handler(request, res) {

    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS header

    console.log("Request body:", request.body);
    console.log("Incoming request:", request.method, JSON.stringify(request.query));
    const method = request.method.toUpperCase();

    try {
        if (method === 'POST') {
            const { code, state: user_id } = request.body;
            if (!user_id || !code) return res.status(400).json({ error: "Missing code or user_id in POST" });

            const tokenData = await CodeForToken(code);
            console.log("POST hit with:", code, user_id);
            await storeTokens(user_id, tokenData);

            return res.status(200).json({ message: "Spotify connected successfully" });
        }
        else if (method === 'GET') {
            const { user_id } = Object.assign({}, request.query);
            if (!user_id) return res.status(400).json({ error: "Missing user_id in GET" });

            const tokens = await getStoredTokens(user_id);
            if (!tokens) return res.status(404).json({ error: "No tokens found" });
            
            return res.status(200).json(tokens);
        }
        
        return res.status(405).json({ error: `Method ${method} not allowed` });
    } catch (error) {
        console.log("Spotify API route error:", error);
        return res.status(502).json({ error: error.message || "Unknown error"});
    }
}

/* ====== HELPER FUNCTIONS ====== */

/* Exchange Spotify code for token */
async function CodeForToken(code) {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${clientAuth}`,
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || "Failed to get token");
    return data;
}

/* Store token in Supabase */
async function storeTokens(user_id, data) {
    console.log("Storing tokens for user:", user_id);
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    const { error } = await supabase.from('spotify_tokens').upsert({
        user_id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
    });

    if (error) throw error;
}

async function getStoredTokens(user_id) {
    const { data: tokenRow, error } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', user_id)
        .single();

    if (error || !tokenRow) return null;

    // Check for expiration on tokens
    const isExpired = new Date(tokenRow.expires_at) <= new Date();
    if (!isExpired) return { access_token: tokenRow.access_token };

    
    // Refresh if tokens are expired
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${clientAuth}`,
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenRow.refresh_token,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || "Failed to refresh token");

    // Store the refreshed token to database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    await supabase
        .from('spotify_tokens')
        .update({
            access_token: data.access_token,
            expires_at: expiresAt,
        })
        .eq('user_id', user_id);

    return { access_token: data.access_token };
}

