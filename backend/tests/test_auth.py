import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_workflow_end_to_end():
    # 1. Register new user
    reg_payload = {
        "email": "test_bot@codeforge.ai",
        "password": "ValidPassword999!",
        "full_name": "Test Engineer"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code in [200, 400]  # 400 if already exists from prior test run

    # 2. Login
    login_payload = {
        "email": "test_bot@codeforge.ai",
        "password": "ValidPassword999!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    assert len(token) > 20

    # 3. Access protected me endpoint with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test_bot@codeforge.ai"

    # 4. Invalid credentials should fail
    bad_login = client.post("/api/auth/login", json={"email": "test_bot@codeforge.ai", "password": "WrongPassword"})
    assert bad_login.status_code == 401

def test_auth_invalid_email_format():
    res = client.post("/api/auth/register", json={"email": "not-an-email", "password": "secretPassword123"})
    assert res.status_code == 422
