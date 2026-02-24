import requests
import json
import sys

BASE_URL = 'http://localhost:8000'

def test_auth():
    print("--- Starting Backend Authentication Tests ---")
    
    # 1. Register
    reg_data = {
        "username": "TestUser", # Should be lowercased
        "email": "testuser@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    
    print("Testing Registration...")
    reg_res = requests.post(f"{BASE_URL}/api/auth/register/", json=reg_data)
    if reg_res.status_code == 201:
        print("✅ Registration successful")
    else:
        print(f"❌ Registration failed: {reg_res.text}")
        # If it failed because user exists (e.g. from previous run), let's try login
        if "exists" not in reg_res.text:
            return

    # 2. Login
    login_data = {
        "username": "testuser", # Use lowercase version
        "password": "Password123!"
    }
    print("Testing Login...")
    login_res = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    if login_res.status_code == 200:
        print("✅ Login successful")
        token = login_res.json()['access']
    else:
        print(f"❌ Login failed: {login_res.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Profile (Me)
    print("Testing /me/ endpoint...")
    me_res = requests.get(f"{BASE_URL}/api/auth/me/", headers=headers)
    if me_res.status_code == 200:
        data = me_res.json()
        print(f"✅ /me/ successful: {data}")
        if data['username'] == 'testuser' and data['name_set'] == False:
            print("✅ Profile data correct")
        else:
            print("❌ Profile data mismatch")
    else:
        print(f"❌ /me/ failed: {me_res.text}")

    # 4. Update Profile
    update_data = {"name": "Test Name 🌟", "username": "testuser_new"}
    print("Testing Profile Update...")
    up_res = requests.patch(f"{BASE_URL}/api/auth/profile/", json=update_data, headers=headers)
    if up_res.status_code == 200:
        data = up_res.json()
        print(f"✅ Profile Update successful: {data}")
        if data['name'] == "Test Name 🌟" and data['username'] == "testuser_new" and data['name_set'] == True:
            print("✅ Updated profile data correct")
        else:
            print("❌ Updated profile data mismatch")
    else:
        print(f"❌ Profile Update failed: {up_res.text}")

    # 5. Change Password
    pw_data = {
        "old_password": "Password123!",
        "new_password": "NewPassword123!",
        "confirm_new_password": "NewPassword123!"
    }
    print("Testing Change Password...")
    pw_res = requests.post(f"{BASE_URL}/api/auth/change-password/", json=pw_data, headers=headers)
    if pw_res.status_code == 200:
        print("✅ Password change successfully")
    else:
        print(f"❌ Password change failed: {pw_res.text}")

if __name__ == "__main__":
    test_auth()
