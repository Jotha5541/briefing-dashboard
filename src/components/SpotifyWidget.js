import React, { useState, useEffect } from 'react';
import axios from 'axios';


function SpotifyWidget({ userId }) {
    const [spotifyData, setSpotifyData] = useState(null);
    const [loading, setLoading] = useState(true);

    /* Fetches current Spotify track */
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


    useEffect(() => {
        fetchSpotify();
        const interval = setInterval(fetchSpotify, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []); // Empty array means this effect runs once

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