import pytest
from pathlib import Path
from app.tools.patch_engine import PatchValidator, PatchApplier, PatchRollback, PatchValidationError

def test_syntax_validation():
    valid_code = "def add(a, b):\n    return a + b\n"
    # Should not raise
    PatchValidator.validate_code_syntax("calculator.py", valid_code)

    broken_code = "def broken(:\n    return 42\n"
    with pytest.raises(PatchValidationError) as exc:
        PatchValidator.validate_code_syntax("broken.py", broken_code)
    assert "Syntax error" in str(exc.value)

def test_patch_application_and_rollback(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    target_file = ws / "main.py"
    target_file.write_text("x = 1\ny = 2\n")

    rollback = PatchRollback(ws)
    rollback.capture("main.py")

    # Apply replacement
    PatchApplier.apply_replacement(ws, "main.py", "x = 10\ny = 20\n")
    assert target_file.read_text() == "x = 10\ny = 20\n"

    # Rollback
    rollback.rollback_all()
    assert target_file.read_text() == "x = 1\ny = 2\n"
