import json
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# ===== Database Connection ===== #
try:
    mongo_uri = os.environ.get('MONGO_URI')
    if not mongo_uri:
        raise ValueError("MONGO_URI environment variable not set.")
    
    # Initializing database client
    client = MongoClient(mongo_uri)
    db = client.dashboard
    users_collection = db.users
    
    client.admin.command('ismaster')
    print("MongoDB connection successful.")
    
except (ConnectionFailure, ValueError) as e:
    print(f"Error connecting to MongoDB: {e}")
    client = None
    
# ===== Lambda Handler Function ===== #
def update_settings(event, context):
    if client is None:
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "Database connection error. Check Lambda logs for details."})
        }

    try:
        user_id = "user_12345"  # Hard-coding user ID for testing
        
        request_body = json.loads(event.get('body', '{}'))
        new_settings = request_body.get('settings')
        
        if not new_settings or not isinstance(new_settings, dict):
            return {
                "statusCode": 400,  # Bad Request
                "body": json.dumps({"message": "Invalid or missing 'settings' object in request body."})
            }
            
        result = users_collection.update_one(
            {"_id": user_id},
            {"$set": {"settings": new_settings}}
        )
        
        if result.matched_count == 0:
            return {
                "statusCode": 404,  # Error Not Found
                "body": json.dumps({"message": "User with ID '{user_id}' not found."})
            }
           
        return {
            "statusCode": 200,  # Successful request
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            },
            "body": json.dumps({"message": "Settings updated successfully."})
        }
        
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Invalid JSON format."})
        }
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            "statusCode": 500,    # Internal Server Error
            "body": json.dumps({"message": "An internal server error occurred."})
        }
    