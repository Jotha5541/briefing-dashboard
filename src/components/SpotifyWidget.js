import { useState, useEffect } from 'react';
import axios from 'axios';
import supabase from '../supabaseClient';


function SpotifyConnectButton() {
    const handleSpotifyLogin = async () => {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) return alert("You must be logged in to connect Spotify.");

        const user = data.user;

        const authUrl = 'https://accounts.spotify.com/authorize?' + 
            new URLSearchParams({
                client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
                response_type: 'code',
                redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
                scope: 'user-read-currently-playing user-read-playback-state',
                state: user.id,  // Pass user_id in state for later use
                show_dialog: 'true',
            });

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

    /* Fetches current Spotify track */
    useEffect(() => {
        if (!userId) return;

        const fetchSpotify = async () => {
            try {
                const tokenResponse = await axios.get(`/api/spotify?user_id=${userId}`);
                const { access_token } = tokenResponse.data;

                const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
                    headers: { Authorization: `Bearer ${access_token}` },
                });

                setSpotifyData(response.data);
            } catch (error) {
                console.error("Error while fetching Spotify data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSpotify();
        const interval = setInterval(fetchSpotify, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [userId]);

    if (userId) return <SpotifyConnectButton />;
    if (loading) return <div>Loading Spotify song...</div>;
    if (!spotifyData || !spotifyData.item) return <div>No song currently playing</div>;

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