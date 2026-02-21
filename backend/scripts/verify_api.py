import json
import urllib.request
import urllib.error

def test_api():
    # Helper to clean/setup would be nice but we'll specific flow
    
    # 1. Login as Provider
    login_url = "http://127.0.0.1:8000/api/auth/login/"
    # We need to register a provider first or assume one exists. 
    # Let's register a new one to be safe
    register_url = "http://127.0.0.1:8000/api/auth/register/"
    provider_email = "doc@example.com"
    provider_data = {
        "email": provider_email, "password": "password123", "role": "PROVIDER", 
        "first_name": "Dr", "last_name": "House", "phone": "1112223333"
    }
    
    headers = {"Content-Type": "application/json"}
    
    print("--- Registering Provider ---")
    try:
        req = urllib.request.Request(register_url, data=json.dumps(provider_data).encode(), headers=headers)
        urllib.request.urlopen(req)
        print("Provider registered.")
    except urllib.error.HTTPError as e:
        print(f"Provider registration skipped (might exist): {e.code}")

    print("\n--- Logging in Provider ---")
    login_data = {"email": provider_email, "password": "password123"}
    req = urllib.request.Request(login_url, data=json.dumps(login_data).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            provider_token = data['access']
            print("Provider Token received.")
    except urllib.error.HTTPError as e:
        print(f"Provider Login Failed: {e.code}")
        return

    # 2. Create Service
    print("\n--- Creating Service ---")
    service_url = "http://127.0.0.1:8000/api/services/"
    service_data = {
        "name": "General Checkup",
        "description": "Regular health checkup",
        "duration": 30,
        "price": "50.00"
    }
    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {provider_token}"
    
    try:
        req = urllib.request.Request(service_url, data=json.dumps(service_data).encode(), headers=auth_headers)
        with urllib.request.urlopen(req) as resp:
            service = json.loads(resp.read().decode())
            service_id = service['id']
            print(f"Service Created: {service['name']} (ID: {service_id})")
    except urllib.error.HTTPError as e:
        print(f"Create Service Failed: {e.code} - {e.read().decode()}")
        return

    # 3. Client Flow
    print("\n--- Registering Client ---")
    client_email = "patient@example.com"
    client_data = {
        "email": client_email, "password": "password123", "role": "CLIENT", 
        "first_name": "John", "last_name": "Doe"
    }
    try:
        req = urllib.request.Request(register_url, data=json.dumps(client_data).encode(), headers=headers)
        urllib.request.urlopen(req)
        print("Client registered.")
    except:
        pass

    print("\n--- Logging in Client ---")
    login_data['email'] = client_email
    req = urllib.request.Request(login_url, data=json.dumps(login_data).encode(), headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        client_token = data['access']
        print("Client Token received.")
    
    # 4. Book Appointment
    print("\n--- Booking Appointment ---")
    booking_url = "http://127.0.0.1:8000/api/appointments/"
    booking_data = {
        "service": service_id,
        "provider": 1, # This might be wrong if provider ID is not 1. BUT Appointment model needs Provider ID.
        # Wait, Appointment model has 'provider' field. Service has 'provider'. 
        # Ideally we get provider ID from service, but serializer requires it.
        # Let's start with hardcoded or fetch. The previous service response has 'provider' field (ID).
    }
    # Fix: Get provider ID from service response
    booking_data['provider'] = service['provider']
    booking_data['date'] = "2026-03-01"
    booking_data['time_slot'] = "10:00:00"

    client_headers = headers.copy()
    client_headers["Authorization"] = f"Bearer {client_token}"

    try:
        req = urllib.request.Request(booking_url, data=json.dumps(booking_data).encode(), headers=client_headers)
        with urllib.request.urlopen(req) as resp:
            booking = json.loads(resp.read().decode())
            print(f"Appointment Booked! ID: {booking['id']}, Status: {booking['status']}")
    except urllib.error.HTTPError as e:
        print(f"Booking Failed: {e.code} - {e.read().decode()}")

if __name__ == "__main__":
    test_api()
