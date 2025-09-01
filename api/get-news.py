from newsapi import NewsApiClient

import os
import requests

class NewsHandler:
    def __init__(self):
        self.newsapi = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))

    def get_top_headlines(self, country='us'):
        headlines = self.newsapi.get_top_headlines(country=country)
        return headlines