import fetch from "node-fetch";

export default async function handler(request, res) {

    const tokenUrl = 'https://accounts.spotify.com/api/token';

    try {
        if (request.method === 'POST' && request.body.code) {
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

            return res.status(200).json({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
            });
        }

        if (request.method === 'POST' && request.body.refresh_token) {
            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + 
                        ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
                },
                    body: new URLSearchParams({
                        grant_type: "refresh_token",
                        refresh_token: request.body.refresh_token,
                    }),
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error_description || "Failed to refresh token");

            return res.status(200).json({
                access_token: data.access_token,
                expires_in: data.expires_in,
            });
        }

        return res.status(405).json({ error: "Method not allowed" });

    } catch (error) {
        return res.status(502).json({ error: error.message });
    }
}
