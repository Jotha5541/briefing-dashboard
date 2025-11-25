import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import supabase from '../../supabaseClient';
import { SpotifyLogo, IconPrev, IconNext, IconPlay, IconPause } from './SVGIcons';

// --- Helper: Format MS to MM:SS ---
const formatTime = (ms) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

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
                scope: 'user-read-currently-playing user-read-playback-state user-modify-playback-state',
                state: user.id,
                show_dialog: 'true',
            });
        
        console.log("Redirecting to Spotify Auth URL:", authUrl);
        window.location.href = authUrl;
    };

    return (
        <button 
            onClick={handleSpotifyLogin} 
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-400 transition-transform hover:scale-105 shadow-lg"
        >
            <SpotifyLogo />
            <span> Connect to Spotify </span>
        </button>
    );
}

function SpotifyWidget({ userId }) {
    const [spotifyData, setSpotifyData] = useState(null);
    const [accessToken, setAccessToken] = useState(null);   // For playback buttons
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);  // Check for tokens
    const [authorized, setAuthorized] = useState(false);

    /* Track Progress States */
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [smoothTransition, setSmoothTransition] = useState(true);
    const lastTrackID = useRef(null);

    /* Fetches Spotify Token and Data */
    const fetchSpotify = useCallback(async () => {
        if (!userId) { setLoading(false); return; }

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
            setAccessToken(access_token);
    
            const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: { Authorization: `Bearer ${access_token}` },
            });
    
            if (response.status === 204 || !response.data) {
                setSpotifyData(null); // No content, nothing playing
                setIsPlaying(false);
            } else {
                const currentTrackID = response.data.item.id;

                if (lastTrackID.current !== currentTrackID) {
                    setSmoothTransition(false);
                    lastTrackID.current = currentTrackID;

                    setTimeout(() => setSmoothTransition(true), 500);
                }

                setSpotifyData(response.data);
                setProgress(response.data.progress_ms);
                setDuration(response.data.item.duration_ms);
                setIsPlaying(response.data.is_playing);
            }
    
            setError(false);
        } catch (error) {
            console.error("Error while fetching Spotify data:", error);
            if (error.response?.status === 401) setAuthorized(false);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /* Poll Interval */
    useEffect(() => {
        fetchSpotify();
        const interval = setInterval(fetchSpotify, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [fetchSpotify]);

    /* Local Interpolation */
    useEffect(() => {
        if (!isPlaying || !duration) return;

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= duration) return duration;
                return prev + 1000;
            });
        }, 1000);

        return () => clearInterval(progressInterval);
    }, [isPlaying, duration]);

    /* Player Control Buttons */
    const handleControl = async (command) => {
        if (!accessToken) { alert("Spotify is disconnected. Please refresh."); return; }

        let url = '', method = 'POST';

        switch (command) {
            case 'next': url = "https://api.spotify.com/v1/me/player/next"; setSmoothTransition(false); break;
            case 'previous': url = "https://api.spotify.com/v1/me/player/previous"; setSmoothTransition(false); break;
            case 'play': url = "https://api.spotify.com/v1/me/player/play"; method = 'PUT'; break;
            case 'pause': url = "https://api.spotify.com/v1/me/player/pause"; method = 'PUT'; break;
            default: return;
        }

        try {
            if (command === 'play') setIsPlaying(false);
            if (command === 'pause') setIsPlaying(false);

            await axios({ method, url, headers: { Authorization: `Bearer ${accessToken}`} });

            setTimeout(() => {
                fetchSpotify();
                setTimeout(() => setSmoothTransition(true), 100);
            }, 100);
        } catch (err) {
            console.error("Control error: ", err.response?.data || err.message);

            if (err.response) {
                switch (err.response.status) {
                    case 403: alert("Action forbidden. You likely need Spotify Premium."); break;
                    case 404: alert("No Active Device found. Open Spotify on your device and play a song."); break;
                    default: console.error("Unhandled Spotify Error: ", err.response.data);
                }
            }
        }
    };

    /* Execute Spotify Logic */
    if (loading) return <div className="text-white animate-pulse">Loading Spotify...</div>;
    if (!authorized || error) return <SpotifyConnectButton />;
    if (!spotifyData || !spotifyData.item) return (
        <div className="spotify-widget p-4 rounded-xl shadow-md bg-zinc-900 text-white w-full md:w-1/2 lg:w-1/3 min-w-[320px] border border-zinc-800">
            <p className="font-bold text-sm text-gray-400 text-center"> Nothing playing right now. </p>
        </div>
    );

    const track = spotifyData.item;
    const progressRatio = duration ? (progress / duration) * 100 : 0;
    
    return (
        <div className="spotify-widget p-5 rounded-xl shadow-2xl bg-zinc-900 text-white w-full md:w-1/2 lg:w-1/2 min-w-[480px] border border-zinc-800 transition-all duration-300">
            {/* Header Component */}
            <h2 className="text-xl font-bold mb-2"> Spotify </h2>
            <div className="flex items-center justify-between mb-4 opacity-80">
                <SpotifyLogo />
                <h2 className="text-xs font-bold mb-2">Now Playing on Spotify</h2>
            </div>

            {/* Album/Track Component */}
            <div className="flex flex-col items-center mb-5 group">
                <div className="relative">
                    <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className={`w-64 h-64 rounded-lg shadow-xl object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100 grayscale-50'}`}
                    />
                    {/* Progress Bar Visual */}
                    <div className='w-full max-w-[250px] mt-4'>
                        <div className='w-full bg-gray-700 h-1.5 rounded-full overflow-hidden'>
                            <div 
                                className={`bg-green-500 h-full ${smoothTransition ? 'transition-all duration-1000 ease-linear' : ''}`}
                                style={{ width: `${progressRatio}%` }}
                            ></div>
                        </div>
                        {/* Timestamp Labels */}
                        <div className="flex justify-between w-full text-[10px] text-gray-400 mt-1 font-mono">
                            <span>{formatTime(progress)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>

                <div className='text-center mt-4 w-full px-2'>
                    <p className='font-bold text-lg truncate hover:text-green-400 transition-colors cursor-default' title={track.name}>
                        {track.name}
                    </p>
                    <p className='text-sm text-gray-400 truncate hover:text-white transition-colors cursor-default'>
                        {track.artists.map((artist) => artist.name).join(', ')}
                    </p>
                </div>
            </div>

            {/* Control Buttons */}
            <div className='flex justify-center items-center gap-6'>
                <button
                    onClick={() => handleControl('previous')}
                    className='text-gray-400 hover:text-white transition-transform active:scale-90 focus:outine-none'
                    aria-label='Previous'
                >
                    <IconPrev />
                </button>

                <button
                    onClick={() => handleControl(isPlaying ? 'pause' : 'play')}
                    className='w-14 h-14 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg hover:bg-gray-100 active:scale-95 focus:outline-none'
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <IconPause /> : <IconPlay />}
                </button>

                <button
                    onClick={() => handleControl('next')}
                    className='text-gray-400 hover:text-white transition-transform active:scale-90 focus:outline-none'
                    aria-label='Next'
                >
                    <IconNext />
                </button>
            </div>
        </div>
    ); 
}

export default SpotifyWidget;