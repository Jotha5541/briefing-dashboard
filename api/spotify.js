import fetch from "node-fetch";

import { SpotifyAPI } from "spotify-web-api-js";

export default async function handler(request, res) {
    const spotifyApi = new SpotifyAPI(
        {
            clientID: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI,
        }
    );

    const token = request.headers.authorization?.split(' ')[1];  // Extract token from header

    if (!token) {
        return res.status(401).json({ error: "No auth token found!" });
    }

    spotify.setAccessToken(token);

    // Now you can use the spotify object to make API calls
    try {
        if (request.method === 'GET') {}

        if (request.method === 'PUT') {}

        if (request.method === 'POST') {}
    }
    catch (error) {
        console.error('Spotify API error:', error);
        return res.status(500).json({ error: error.message });
    }
}