import requests
import sys

BASE_URL = "http://localhost:8000/api"

def run_test():
    # 1. Login as Client
    print("Logging in as Client...")
    login_resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": "client@example.com",
        "password": "password123"
    })
    if login_resp.status_code != 200:
        # Try registering if login fails
        print("Login failed, trying to register client...")
        requests.post(f"{BASE_URL}/auth/register/", json={
            "email": "client@example.com",
            "password": "password123",
            "role": "CLIENT",
            "first_name": "Test",
            "last_name": "Client"
        })
        login_resp = requests.post(f"{BASE_URL}/auth/login/", json={
            "email": "client@example.com",
            "password": "password123"
        })
    
    if login_resp.status_code != 200:
        print(f"Failed to login: {login_resp.text}")
        sys.exit(1)
        
    token = login_resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get a Service (any service)
    print("Fetching services...")
    services_resp = requests.get(f"{BASE_URL}/services/", headers=headers)
    if services_resp.status_code != 200 or not services_resp.json():
        print("No services found. Cannot test booking.")
        # Create a provider and service if needed? 
        # For now assume verify_api.py ran and created data.
        sys.exit(1)
        
    service_id = services_resp.json()[0]['id']
    print(f"Targeting Service ID: {service_id}")

    # 3. Book Appointment WITHOUT provider field
    print("Attempting to book without 'provider' field...")
    booking_payload = {
        "service": service_id,
        "date": "2026-12-01",
        "time_slot": "10:00:00"
    }
    
    book_resp = requests.post(f"{BASE_URL}/appointments/", json=booking_payload, headers=headers)
    
    if book_resp.status_code == 201:
        data = book_resp.json()
        print("Booking SUCCESS!")
        print(f"Appointment ID: {data['id']}")
        print(f"Provider ID (Inferred): {data['provider']}")
        # Verify provider matches service provider
        service_provider = services_resp.json()[0]['provider']
        if data['provider'] == service_provider:
             print("Verified: Inferred provider matches service provider.")
        else:
             print(f"WARNING: Mismatch. Service Provider: {service_provider}, Appointment Provider: {data['provider']}")
    else:
        print(f"Booking FAILED: {book_resp.status_code}")
        print(book_resp.text)
        sys.exit(1)

if __name__ == "__main__":
    run_test()
