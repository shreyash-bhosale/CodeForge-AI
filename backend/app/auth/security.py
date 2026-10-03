import hashlib
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from app.config import settings

def hash_password(password: str) -> str:
    """
    Cryptographically secure password hash using PBKDF2-HMAC-SHA256 with random salt.
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    )
    return f"{salt}${key.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """
    Verifies a password against the stored salt$key hash.
    """
    try:
        salt, key_hex = hashed.split('$', 1)
        expected_key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100_000
        )
        return secrets.compare_digest(expected_key.hex(), key_hex)
    except Exception:
        return False

def generate_session_token() -> str:
    return secrets.token_urlsafe(48)
