import fetch from "node-fetch";

export default async function handler(req, res) {
  const { city = "Corona" } = req.query; // default to Corona if no city
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing WEATHER_API_KEY in environment" });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: "Failed to fetch weather data", provider_error: errorText });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS header
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
