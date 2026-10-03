import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

def test_get_users():
    response = client.get("/users")
    assert response.status_code == 200
    assert len(response.json()) >= 2

def test_health_check():
    """
    Validation test for G-002 / FR-017:
    System should implement /health returning status=ok and healthy=True
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["healthy"] is True
