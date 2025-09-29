import handler from './spotify';

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default async function SpotifyCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code || !userId) {
            alert("Missing code or user ID in Spotify callback.");
            navigate('/dashboard');
            return;
        }

        axios.post('/api/spotify-callback', { code, user_id: userId })
            .then(() => navigate('/dashboard'))
            .catch(error => {
                console.error("Spotify token exchange failed:", error);
                alert("Failed to connect Spotify");
                navigate('/dashboard');
            });
    }, [navigate]);

    return <div>Connecting to Spotify...</div>;
}
