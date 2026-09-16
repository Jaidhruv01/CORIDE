import pytest
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.models.entities import User


@pytest.fixture
def admin_token(db):
    admin = User(
        id="usr-test-admin",
        name="Admin Test",
        email="admin.test@coride.com",
        password_hash=get_password_hash("adminpass123"),
        is_admin=True
    )
    db.add(admin)
    db.commit()
    return create_access_token(subject=admin.id)


@pytest.fixture
def rider_token(db):
    rider = User(
        id="usr-test-rider",
        name="Rider Test",
        email="rider.test@coride.com",
        password_hash=get_password_hash("riderpass123"),
        is_admin=False
    )
    db.add(rider)
    db.commit()
    return create_access_token(subject=rider.id)


def test_admin_security_unlock_success(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post(
        "/api/v1/admin/auth/unlock",
        json={"pin": settings.ADMIN_SECURITY_PIN},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Master Admin Clearance Granted" in data["message"]


def test_admin_security_unlock_invalid_pin(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post(
        "/api/v1/admin/auth/unlock",
        json={"pin": "000000"},
        headers=headers
    )
    assert response.status_code == 401
    assert "Invalid Master Security PIN" in response.json()["detail"]


def test_admin_security_unlock_non_admin_forbidden(client, rider_token):
    headers = {"Authorization": f"Bearer {rider_token}"}
    response = client.post(
        "/api/v1/admin/auth/unlock",
        json={"pin": settings.ADMIN_SECURITY_PIN},
        headers=headers
    )
    assert response.status_code == 403


def test_admin_audit_logs(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Unlock to generate an audit log
    client.post(
        "/api/v1/admin/auth/unlock",
        json={"pin": settings.ADMIN_SECURITY_PIN},
        headers=headers
    )
    # Fetch logs
    response = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) > 0

