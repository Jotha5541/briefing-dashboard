import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { city = "Corona" } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: "Weather API failed", details: err });
    }

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
