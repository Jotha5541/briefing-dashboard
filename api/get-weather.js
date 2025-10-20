import fetch from "node-fetch";

export default async function handler(request, res) {
  const city = request.query.city; 
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing WEATHER_API_KEY in environment" });
  }

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    /* Coordinates for Long/Lat of City */
    const coordsUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;
    const coordsRes = await fetch(coordsUrl);

    if (!coordsRes.ok) {
      const errorText = await coordsRes.text();
      return res
        .status(coordsRes.status)
        .json({ error: "Failed to fetch weather data", provider_error: errorText });
    }

    const coordsData = await coordsRes.json();
    const { lat, lon } = coordsData.coord;

    /* Fetching forecast data using coordinates */
    const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const forecastRes = await fetch(forecastUrl);

    if (!forecastRes.ok) {
      const errorText = await forecastRes.text();
      return res
        .status(forecastRes.status)
        .json({ error: "Failed to fetch forecast data", provider_error: errorText });
    }

    const forecastData = await forecastRes.json();

    /* Filter Daily Forecasts (daily + hourly) */
    const dailyData = forecastData.daily.map((day) => ({
      dt: day.dt,
      sunrise: day.sunrise,
      sunset: day.sunset,
      temp: {
        min: Math.round(day.temp.min),
        max: Math.round(day.temp.max),
      },
      weather: day.weather,
      uvi: day.uvi,
    }));

    /* Formatting hourly data to 12-hour format */
    const hourlyData = forecastData.hourly.map((hour) => ({
      dt: hour.dt,
      temp: Math.round(hour.temp),
      weather: hour.weather
    }));

    
    /* Format for current city weather conditions */
    const current = {
      dt: forecastData.current.dt,
      temp: Math.round(forecastData.current.temp),
      weather: forecastData.current.weather,
      uvi: forecastData.current.uvi,
      sunrise: forecastData.current.sunrise,
      sunset: forecastData.current.sunset,
    };


    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS header
    return res.status(200).json({
      city: coordsData.name, current,
      daily: dailyData,
      hourly: hourlyData,
    });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
