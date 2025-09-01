import json
import os
import requests
from urllib.parse import parse_qs, urlparse, quote

def handler(event, context):
    api_key = os.environ.get("WEATHER_API_KEY")

    # Default city = Corona
    query = parse_qs(urlparse(event["rawPath"] + "?" + event.get("rawQueryString", "")).query)
    city = quote(query.get("city", ["Corona"])[0])

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=imperial"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(response.json()),
            }
        else:
            return {
                "statusCode": response.status_code,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({
                    "error": "Failed to fetch weather data",
                    "provider_error": response.text,
                }),
            }
    except requests.exceptions.RequestException as e:
        return {
            "statusCode": 502,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
