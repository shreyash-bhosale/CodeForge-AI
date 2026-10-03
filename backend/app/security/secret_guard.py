import re
from typing import List, Tuple

class SecretScanner:
    """
    Detects sensitive tokens, credentials, and API keys to prevent accidental
    leakage to LLM prompts, logs, or external telemetry streams.
    """
    PATTERNS: List[Tuple[str, re.Pattern]] = [
        ("OpenAI API Key", re.compile(r"sk-[a-zA-Z0-9]{20,T3BlbkFJ[a-zA-Z0-9]{20,}")),
        ("Generic API Key", re.compile(r"(?i)(?:api_key|apikey|secret_key|auth_token)\s*[:=]\s*['\"][a-zA-Z0-9_\-]{16,}['\"]")),
        ("GitHub Personal Token", re.compile(r"gh[pous]_[a-zA-Z0-9]{36,255}")),
        ("AWS Access Key ID", re.compile(r"(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}")),
        ("JWT Secret/Bearer", re.compile(r"ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*")),
        ("Private Key Header", re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----")),
        ("Database Connection URI", re.compile(r"(?i)(?:postgres|postgresql|mysql|mongodb|redis):\/\/[a-zA-Z0-9_]+:[^@\s]+@[a-zA-Z0-9.-]+")),
    ]

    @classmethod
    def scan_text(cls, text: str) -> List[str]:
        findings = []
        if not text:
            return findings
        for name, pattern in cls.PATTERNS:
            if pattern.search(text):
                findings.append(name)
        return findings

class SecretRedactor:
    """
    Sanitizes strings by replacing credential and secret matches with [REDACTED].
    """
    @classmethod
    def redact(cls, text: str) -> str:
        if not text:
            return text
        sanitized = text
        for _, pattern in SecretScanner.PATTERNS:
            sanitized = pattern.sub("[REDACTED_SECRET]", sanitized)
        return sanitized

class CredentialGuard:
    """
    Validates whether a file is a sensitive credential store that should be protected
    from automated modification without explicit human authorization.
    """
    PROTECTED_FILENAMES = {
        ".env", ".env.local", ".env.production", ".env.staging",
        "id_rsa", "id_ed25519", "credentials.json", "service-account.json",
        ".npmrc", ".pypirc", "client_secrets.json"
    }

    @classmethod
    def is_protected_file(cls, filename: str) -> bool:
        lower = filename.lower()
        parts = lower.replace("\\", "/").split("/")
        base_name = parts[-1]
        if base_name in cls.PROTECTED_FILENAMES:
            return True
        if base_name.startswith(".env."):
            return True
        return False
