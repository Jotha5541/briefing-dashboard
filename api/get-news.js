import fetch from 'node-fetch';

export default async function handler(request, res) {
    const { country = 'us', category = 'technology' } = request.query; // Default to US tech news
    const apiKey = process.env.NEWS_API_KEY;    // Retrieve News API key from environment

    if (!apiKey) {  // Could not find API key
        return res.status(500).json({ error: "Missing NEWS_API_KEY in environment." });
    }

    /* Defining News API URL */
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`;
    // console.log("Fetching news from URL:", url);
    try {
        const response = await fetch(url);  // Request to News API

        if (!response.ok) {
            const errorText = await response.text();
            return res
                .status(response.status)
                .json({ error: "Failed to fetch news data", provider_error: errorText });
        }

        const newsData = await response.json();

        res.setHeader("Access-Control-Allow-Origin", "*"); // CORS header
        return res.status(200).json(newsData);   // Successful response back to frontend
    } catch (error) {   // Logs error onto server
        res.status(502).json({ error: error.message }); // Error response back to frontend
    }

}