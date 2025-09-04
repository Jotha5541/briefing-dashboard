import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewsWidget() {
    const [newsData, setNewsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const apiUrl = 'api/get-news'
                const response = await axios.get(apiUrl);
                setNewsData(response.data);    
            }
            catch (error) {
                console.error("Error while fetching news:", error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return <div>Loading News...</div>;
    }
    if (!newsData) {
        return <div>No news data available</div>;
    }

    return (
        <div className="news-widget">
            <h2>Latest News</h2>
            <ul>
                {newsData.map((article, index) => (
                    <li key={index}>
                        <h3>{article.title}</h3>
                        <p>{article.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NewsWidget;