import axios from 'axios';

export default async function handler(request, response) {
    
    const apiKey = process.env.NEWS_API_KEY;    // Retrieve News API key from environment

    if (!apiKey) {  // Could not find API key
        return response.status(500).json({ error: "API Key is not configured." });
    }

    /* Defining News API URL */
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${apiKey}`;

    try {
        const newsResponse = await axios.get(url);  // Request to News API
        response.status(200).json(newsResponse.data);   // Successful response back to frontend
    } catch (error) {   // Logs error onto server 
        console.error("Error fetching news from News API: ", error.response?.data || error.message);
        response.status(502).json({ error: 'Failed to fetch news data.' }); // Error response back to frontend
    }

}