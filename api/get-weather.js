import fetch from "node-fetch";

export default async function handler(request, res) {
  const { city = "Corona" } = request.query; // Hard-coding city for now
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing WEATHER_API_KEY in environment" });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${(city)}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: "Failed to fetch weather data", provider_error: errorText });
    }

    const weatherData = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS header
    return res.status(200).json(weatherData);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
