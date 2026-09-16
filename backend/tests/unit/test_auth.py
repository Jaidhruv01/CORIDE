def test_register_and_login(client):
    # 1. Register new user
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test.user@example.com",
            "password": "Password123!",
            "phone": "+919988776655",
            "is_driver": True
        }
    )
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test.user@example.com"
    assert data["user"]["is_driver"] is True

    # 2. Duplicate registration should fail
    dup_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate",
            "email": "test.user@example.com",
            "password": "AnotherPassword"
        }
    )
    assert dup_res.status_code == 400

    # 3. Login with correct password
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test.user@example.com",
            "password": "Password123!"
        }
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Login with invalid password
    bad_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test.user@example.com",
            "password": "WrongPassword"
        }
    )
    assert bad_login.status_code == 401
