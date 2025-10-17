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
    const [expandedDay, setExpandedDay] = useState(null); // Toggles hourly forecast

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

    const { city, current, daily, hourly } = weatherData;

    /* Format Helper for Date + Time */
    const formatDate = (unix) =>
        new Date(unix * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });

    const formatTime = (unix) =>
        new Date(unix * 1000).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,   // 12-hour format (set false for 24-hour)
        });

    return (
        <div className="weather-widget w-full md:w-1/3 p-4 rounded-xl shadow-md bg-white/90 backdrop-blur text-gray-900">
            {/* Current Weather Section */}
            <h2 className="text-xl font-bold mb-2">Weather in {city}</h2>
            <div className="flex items-center gap-2">
                <img
                    src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                    alt={current.weather[0].description}
                />
                <div>
                    <p className="text-lg">
                        {Math.round(current.temp)}°F - {current.weather[0].description}
                    </p>
                    <p> UV Index: {current.uvi} </p>
                    <p>
                        Sunrise: {formatTime(current.sunrise)} | Sunset: {formatTime(current.sunset)}
                    </p>
                </div>
            </div>

            {/* Daily Forecast Section */}
            <h3 className="mt-4 font-semibold"> Daily Forecast </h3>
            <ul className="divide-y divide-gray-300">
                {daily.map((day, index) => (
                    <li key={day.dt} className="py-2">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                        >
                            {/* Date and Icon */}
                            <div className="flex items-center gap-2">
                                <img
                                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                                    alt={day.weather[0].description}
                                />
                                {formatDate(day.dt)}
                            </div>
                            {Math.round(day.temp.min)}°F / {Math.round(day.temp.max)}°F
                        </div>

                        {/* Hourly Forecast - Expandable */}
                        <div
                            className={`transition-all duration-500 ease-in-out overflow-hidden
                                ${expandedDay === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`
                            }
                        >
                            <h4 className="font-medium"> Hourly Forecast </h4>
                            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {hourly
                                .filter(
                                    (hour) => 
                                        new Date(hour.dt * 1000).getDate() ===
                                        new Date(day.dt * 1000).getDate()
                                )
                                .map((hour) => (
                                    <li
                                        key={hour.dt}
                                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-md hover:bg-gray-100"
                                    >
                                        {formatTime(hour.dt)}
                                        <div className="flex items-center gap-1">
                                            <img
                                                src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                                                alt={hour.weather[0].description}
                                                className="w-6 h-6"
                                            />
                                            {Math.round(hour.temp)}°F
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WeatherWidget;