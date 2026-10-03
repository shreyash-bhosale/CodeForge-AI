import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import Settings
from app.models.database import (
    SessionLocal, 
    RepositoryModel, 
    check_db_connection, 
    validate_database_url
)

def test_database_url_resolution_and_dialects():
    # 1. Default fallback to local SQLite
    s_default = Settings(DATABASE_URL="")
    assert "sqlite:///" in s_default.resolved_database_url
    assert not s_default.is_postgres

    # 2. Postgres normalization (postgres:// -> postgresql://)
    s_pg = Settings(DATABASE_URL="postgres://user:pass@db.supabase.co:5432/postgres")
    assert s_pg.resolved_database_url.startswith("postgresql://")
    assert s_pg.is_postgres

    # 3. Direct postgresql:// URL
    s_direct = Settings(DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres")
    assert s_direct.resolved_database_url.startswith("postgresql://")
    assert s_direct.is_postgres

def test_validate_database_url_invalid_scheme():
    # Valid schemes should pass without error
    validate_database_url("postgresql://postgres:pass@localhost:5432/postgres")
    validate_database_url("sqlite:///./data/test.db")

    # Invalid scheme should raise ValueError with actionable message
    with pytest.raises(ValueError) as exc:
        validate_database_url("mysql://root:pass@localhost:3306/db")
    assert "Invalid DATABASE_URL scheme 'mysql://'" in str(exc.value)
    assert "Supabase" in str(exc.value)

def test_check_db_connection():
    result = check_db_connection()
    assert result["status"] == "connected"
    assert result["dialect"] in ("sqlite", "postgresql")
    assert isinstance(result["latency_ms"], float)
    assert result["latency_ms"] >= 0
    assert result["error"] is None

def test_database_crud_operations():
    db = SessionLocal()
    try:
        test_repo_id = "test-repo-db-crud-001"
        # Cleanup if leftover
        existing = db.query(RepositoryModel).filter(RepositoryModel.id == test_repo_id).first()
        if existing:
            db.delete(existing)
            db.commit()

        # Create
        repo = RepositoryModel(
            id=test_repo_id,
            name="Database Verification Repo",
            source_type="local",
            workspace_path="/tmp/test_workspace",
            default_branch="main"
        )
        db.add(repo)
        db.commit()

        # Read
        fetched = db.query(RepositoryModel).filter(RepositoryModel.id == test_repo_id).first()
        assert fetched is not None
        assert fetched.name == "Database Verification Repo"
        assert fetched.source_type == "local"

        # Delete
        db.delete(fetched)
        db.commit()

        post_delete = db.query(RepositoryModel).filter(RepositoryModel.id == test_repo_id).first()
        assert post_delete is None
    finally:
        db.close()

def test_health_endpoints_expose_database_status_without_secrets():
    client = TestClient(app)
    
    # Check /health
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("healthy", "degraded")
    assert "database" in data
    assert data["database"]["status"] == "connected"
    assert "dialect" in data["database"]
    # Ensure no credentials or raw URLs leaked
    assert "password" not in str(data).lower()
    assert "@" not in str(data)

    # Check /api/system/status
    res2 = client.get("/api/system/status")
    assert res2.status_code == 200
    data2 = res2.json()
    assert "database" in data2
    assert "database_details" in data2
    assert "password" not in str(data2).lower()
