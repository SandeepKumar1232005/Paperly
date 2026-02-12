
import pymongo
import os
import certifi
import dns.resolver

MONGO_URI = "mongodb+srv://paperly:paperly123@cluster0.mongodb.net/?retryWrites=true&w=majority"
# Reading env var if possible, but hardcoding for test based on previous context if available. 
# Wait, I don't know the exact URI user has. I should read .env.

from dotenv import load_dotenv
load_dotenv()

uri = os.environ.get('MONGO_URI')
print(f"Testing connection to: {uri}")

try:
    client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
    client.admin.command('ping')
    print("✅ Connected successfully with certifi!")
except Exception as e:
    print(f"Initial connection failed: {e}")
    try:
        print("Retrying with SSL disabled...")
        client = pymongo.MongoClient(uri, tls=True, tlsAllowInvalidCertificates=True)
        client.admin.command('ping')
        print("Connected successfully with SSL disabled!")
    except Exception as e2:
        print(f"Retry failed: {e2}")
