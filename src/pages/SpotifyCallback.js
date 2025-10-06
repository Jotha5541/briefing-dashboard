import { useEffect } from "react";
import axios from "axios";

export default function SpotifyCallback() {
    useEffect(() => {
        const callback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            if (!code || !state) {
                alert("Missing code or user ID in Spotify callback.");
                return window.location.replace('/');
            }

            try {
                await axios.post('/api/spotify', { code, state });
                window.location.replace('/dashboard');
            } catch(error) {
                console.error("Spotify token exchange failed:", error);
                alert("Failed to connect to Spotify.");
                window.location.replace('/dashboard');
            }
        };
            
        callback();
    }, []);

    return <div>Connecting to Spotify...</div>;
}
