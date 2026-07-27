import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
print(f"Testing connection to: {mongo_uri}")

def test_connection(uri, **kwargs):
    print(f"\nTesting with options: {kwargs}")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, **kwargs)
        client.admin.command('ping')
        print("SUCCESS: Connection successful!")
        return True
    except Exception as e:
        print(f"FAIL: Connection failed: {e}")
        return False

# Test 1: Standard connection
test_connection(mongo_uri)

# Test 2: With tlsAllowInvalidCertificates
test_connection(mongo_uri, tlsAllowInvalidCertificates=True)

import ssl

# Test 3: Force TLS 1.2
context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
test_connection(mongo_uri, tlsContext=context)
