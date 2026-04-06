import requests

def test_mentor_api():
    # First, login as the student (harini)
    login_data = {
        "email": "harini@gmail.com",  # Correct student email
        "password": "password123"      # Assuming this is the password
    }
    
    try:
        # Login to get token
        login_response = requests.post("http://localhost:5000/api/auth/login", json=login_data)
        print("Login response:", login_response.status_code)
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            print("Got token:", token[:20] + "..." if token else "None")
            
            # Test the mentor endpoint
            headers = {"Authorization": f"Bearer {token}"}
            mentor_response = requests.get("http://localhost:5000/api/mentorship/my-mentor", headers=headers)
            print("Mentor API response:", mentor_response.status_code)
            print("Mentor API data:", mentor_response.json())
        else:
            print("Login failed:", login_response.json())
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_mentor_api()
