import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewsWidget() {
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('/api/get-news?country=us');
                setNewsData(response.data.articles || []);
            }
            catch (error) {
                console.error("Error while fetching news data:", error);
            }
            finally {
                setLoading(false);
            }
        }

        fetchNews();
    }, []);

    if (loading) {
        return <div>Loading news...</div>;
    }

  return (
    <div style={{ marginTop: "10px" }}>
      {newsData.slice(0, 5).map((newsData, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "12px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          <h3 style={{ margin: "0 0 5px" }}>{newsData.title}</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
            {newsData.description}
          </p>
          <a href={newsData.url} target="_blank" rel="noopener noreferrer">
            Read more →
          </a>
        </div>
      ))}
    </div>
  );
}

export default NewsWidget;