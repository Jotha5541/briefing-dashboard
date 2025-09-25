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
        return <div> Loading news... </div>;
    }

  return (
    <div style={{ marginTop: "10px" }}>
      {newsData.slice(0, 5).map((newsItem, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "12px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            gap: "10px",
          }}
        >

        {/* Image Thumbnail */}
        {newsItem.urlToImage && (
          <a 
            href={newsItem.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0 }}
          >
            <img
              src={newsItem.urlToImage}
              alt={newsItem.title}
              style={{
                width: "100%",
                height: "70px",
                borderRadius: "6px",
                objectFit: "cover",
              }}
            />
          </a>
        )}

        {/* Text Description */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 5px" }}>
            <a
              href={newsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#333" }}
            >
               {newsItem.title}
            </a>
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
            {newsItem.description}
          </p>
        </div>
      </div>
      ))}
    </div>
  );
}

export default NewsWidget;