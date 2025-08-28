from http.server import BaseHTTPRequestHandler
import json
import os
import requests
from urllib.parse import parse_qs, urlparse
from urllib.parse import quote

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        api_key = os.environ.get('WEATHER_API_KEY')
        
        query_components = parse_qs(urlparse(self.path).query)
        city = query_components.get('city', ['London'])[0]      # Testing city
        encoded_city = quote(city)
        
        url = f"https://api.openweathermap.org/data/2.5/weather?q={encoded_city}&appid={api_key}&units=imperial"
        
        print(f"API Key Received: {api_key}")
        
        try:
            response = requests.get(url)
            
            if response.status_code != 200:
                print(f"OpenWeatherMap API Error: {response.status_code} - {response.text}")
                self.send_response(response.status_code)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_message = {"error": "Failed to fetch weather data from provider.", "provider_error": response.json()}
                self.wfile.write(json.dumps(error_message).encode('utf-8'))
            
            # Success: Sends weather data
            weather_data = response.json()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header('Access-Control-Allow-Origin', '*')    # CORS header
            self.end_headers()
            self.wfile.write(json.dumps(weather_data).encode('utf-8'))
            
        except requests.exceptions.RequestException as e:
            self.send_response(502)
            self.send_header('Content_type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            
        return
            