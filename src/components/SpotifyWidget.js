import { useState, useEffect } from 'react';
import axios from 'axios';
import supabase from '../supabaseClient';

function SpotifyConnectButton() {
    const handleSpotifyLogin = async () => {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) return alert("You must be logged in to connect Spotify.");

        const user = data.user;

        // const redirectURI = 'https://briefing-dashboard.vercel.app/spotify-callback';
        
        const authUrl = 'https://accounts.spotify.com/authorize?' + 
            new URLSearchParams({
                client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
                response_type: 'code',
                redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
                scope: 'user-read-currently-playing user-read-playback-state',
                state: user.id,
                show_dialog: 'true',
            });
        
        console.log("Redirecting to Spotify Auth URL:", authUrl);
        window.location.href = authUrl;
    };

    return (
        <button 
            onClick={handleSpotifyLogin} 
            className="spotify-connect-button px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
            Connect to Spotify
        </button>
    );
}

function SpotifyWidget({ userId }) {
    const [spotifyData, setSpotifyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);  // Check for tokens
    const [authorized, setAuthorized] = useState(false);

    /* Fetches current Spotify track */
    useEffect(() => {
        if (!userId) { setLoading(false); return; }

        const fetchSpotify = async () => {
            try {
                
                const tokenResponse = await axios.get(`/api/spotify?user_id=${userId}`);
                const { access_token } = tokenResponse.data;

                if (!access_token) {
                    setAuthorized(false);
                    setError(true);
                    setLoading(false);
                    return;
                }

                setAuthorized(true);

                const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
                    headers: { Authorization: `Bearer ${access_token}` },
                });

                if (response.status === 204 || !response.data) {
                    setSpotifyData(null); // No content, nothing playing
                } else {
                    setSpotifyData(response.data);
                }

                setError(false);
            } catch (error) {
                console.error("Error while fetching Spotify data:", error);
                setError(true);
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSpotify();
        const interval = setInterval(fetchSpotify, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [userId]);

    if (loading) return <div>Loading Spotify song...</div>;
    if (!authorized || error) return <SpotifyConnectButton />;
    if (!spotifyData || !spotifyData.item) {
        return (
            <div className="spotify-widget p-4 rounded-xl shadow-md bg-black text-white">
                <h2 className="text-lg font-bold mb-2">Now Playing on Spotify</h2>
                <p className="text-sm text-gray-400">Nothing playing right now.</p>
            </div>
        );
    }

    const track = spotifyData.item;
    
    return (
        <div className="spotify-widget p-4 rounded-xl shadow-md bg-black text-white">
            <h2 className="text-lg font-bold mb-2">Now Playing on Spotify</h2>
            {track ? (
                <div className="flex items-center">
                    <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="w-16 h-16 rounded"
                    />
                    <div>
                        <p className="font-medium">{track.name}</p>
                        <p className="text-sm text-gray-400">
                            {track.artists.map((artist) => artist.name).join(', ')}
                        </p>
                    </div>
                </div>
            ) : (
                <p>Nothing playing right now.</p>
            )}
        </div>
    ); 
}

export default SpotifyWidget;