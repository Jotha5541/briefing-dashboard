import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SpotifyWidget() {
    const [spotifyData, setSpotifyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);

    const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
    const SCOPES = [
        "user-read-currently-playing",
        "user-read-playback-state"
    ];

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;

    /* Login Handler Button */


    /* Fetches current Spotify track */
    const fetchSpotify = async (token) => {
        try {
            const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSpotifyData(response.data);

        } catch (error) {
            console.error("Error while fetching Spotify data:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const getTokens = async () => {
            try {
                const response = await axios.post('/api/spotify', {
                    refresh_token: localStorage.getItem('spotify_refresh_token')
                });

                const { access_token } = response.data;

                setAccessToken(access_token);
                fetchSpotify(access_token);

            } catch (error) {
                console.error("Error while getting Spotify tokens:", error);
                setLoading(false);
            }
        };

        getTokens();
    }, []); // Empty array means this effect runs once

    if (loading) return <div>Loading Spotify song...</div>;
    if (!spotifyData) return <div>No song currently playing</div>;

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
                        <p className="text-sm text-gray-600">
                            {track.artists.map(artist => artist.name).join(', ')}
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