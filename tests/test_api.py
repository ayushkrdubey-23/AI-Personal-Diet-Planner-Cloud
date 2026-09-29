from fastapi.testclient import TestClient

from backend.app import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_swagger_docs_endpoint():
    response = client.get("/docs")

    assert response.status_code == 200
    