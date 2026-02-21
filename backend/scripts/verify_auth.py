import json
import urllib.request
import urllib.error

def test_auth():
    # Register
    url = "http://127.0.0.1:8000/api/auth/register/"
    data = {"email": "test@example.com", "password": "password123", "role": "CLIENT", "first_name": "Test", "last_name": "User", "phone": "1234567890"}
    headers = {"Content-Type": "application/json"}

    print(f"Testing Register: {url}")
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            print("Register Status:", response.status)
            print("Response:", response.read().decode())
    except urllib.error.HTTPError as e:
        print("Register Error:", e.code)
        print("Error Response:", e.read().decode())

    # Login
    url_login = "http://127.0.0.1:8000/api/auth/login/"
    data_login = {"email": "test@example.com", "password": "password123"}
    
    print(f"\nTesting Login: {url_login}")
    req_login = urllib.request.Request(url_login, data=json.dumps(data_login).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req_login) as response:
            print("Login Status:", response.status)
            resp_body = response.read().decode()
            print("Response:", resp_body)
            tokens = json.loads(resp_body)
            if 'access' in tokens:
                print("Login SUCCESS: Access token received.")
            else:
                print("Login FAILED: No access token.")
    except urllib.error.HTTPError as e:
        print("Login Error:", e.code)
        print("Error Response:", e.read().decode())

if __name__ == "__main__":
    test_auth()
