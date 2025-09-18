import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

function WeatherWidget() {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { console.warn("No user session"); return; }
                const settingsResponse = await axios.get('/api/userSettings', {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const city = settingsResponse.data.settings.weather?.city || 'Los Angeles'; // Default to 'Los Angeles' if not set
                const weatherResponse = await axios.get(`/api/get-weather?city=${encodeURIComponent(city)}`);

                setWeatherData(weatherResponse.data);
            }
            catch (error) {
                console.error("Error while fetching weather data:", error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);    // Empty array means this effect runs once

    if (loading) {
        return <div>Loading weather...</div>;
    }
    if (!weatherData) {
        return <div>No weather data available</div>;
    }

    return (
        <div className="weather-widget">
            <h2>Weather in {weatherData.name}</h2>
            <p>Temperature: {Math.round(weatherData.main.temp)}°F</p>
            <p>Condition: {weatherData.weather[0].description}</p>
        </div>
    );
}

export default WeatherWidget;