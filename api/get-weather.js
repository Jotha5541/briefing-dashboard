import fetch from "node-fetch";

export default async function handler(request, res) {
  const { city = "Corona" } = request.query; // Hard-coding city for now
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing WEATHER_API_KEY in environment" });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      return res
        .status(res.status)
        .json({ error: "Failed to fetch weather data", provider_error: errorText });
    }

    const data = await res.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS header
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
