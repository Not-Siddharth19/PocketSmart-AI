import os
os.environ["DATABASE_URL"] = "sqlite:///./test_pocketsmart.db"
import pytest
from io import BytesIO
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

@pytest.fixture(scope="function", autouse=True)
def setup_teardown():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'

def test_full_user_flow(client):
    # 1. Register
    reg = client.post('/api/auth/register', json={
        'username': 'tester',
        'email': 'tester@example.com',
        'password': 'secret123'
    })
    assert reg.status_code == 200

    # 2. Login
    login = client.post('/api/auth/login', json={
        'username': 'tester',
        'password': 'secret123'
    })
    assert login.status_code == 200
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # 3. Session info
    s_info = client.get('/api/session-info', headers=headers)
    assert s_info.status_code == 200
    assert s_info.json()['username'] == 'tester'

    # 4. Generate Home Budget
    home_res = client.post('/api/generate-home', headers=headers, json={
        'total_budget': 50000,
        'num_lights': 5,
        'num_fans': 4,
        'num_furniture': 2,
        'num_dining_tables': 1,
        'rooms': ['Living Room', 'Kitchen', 'Bedroom'],
        'style': 'modern'
    })
    assert home_res.status_code == 200
    data = home_res.json()
    assert data['category'] == 'home'
    assert 'budget_breakdown' in data
    assert len(data['budget_breakdown']) > 0

    # 5. Generate Party Budget
    party_res = client.post('/api/generate-party', headers=headers, json={
        'total_budget': 35000,
        'num_guests': 25,
        'party_type': 'Birthday',
        'venue_type': 'Home',
        'needs_catering': True,
        'needs_decoration': True,
        'needs_entertainment': True
    })
    assert party_res.status_code == 200
    pdata = party_res.json()
    assert pdata['category'] == 'party'
    assert 'budget_breakdown' in pdata

    # 6. Generate Jewelry Recommendations (with dummy image upload)
    dummy_img = BytesIO(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00")
    dummy_img.name = "outfit.jpg"
    
    jewel_res = client.post('/api/generate-jewelry', headers=headers, data={
        'budget': 20000,
        'occasion': 'Wedding',
        'style': 'Traditional'
    }, files={'outfit': ('outfit.jpg', dummy_img, 'image/jpeg')})
    assert jewel_res.status_code == 200
    jdata = jewel_res.json()
    assert jdata['category'] == 'jewelry'
    assert 'recommendations' in jdata or 'jewelry_recommendations' in jdata

    # 7. Check History
    hist = client.get('/api/history', headers=headers)
    assert hist.status_code == 200
    assert len(hist.json()) == 3

    # 8. Check Recommendation Details
    rec_id = hist.json()[0]['id']
    detail = client.get(f'/api/recommendations-details/{rec_id}', headers=headers)
    assert detail.status_code == 200
    assert detail.json()['id'] == rec_id

    # 9. Test Settings Page Route
    settings_page = client.get('/settings')
    assert settings_page.status_code == 200

    # 10. Test Password Change
    chg = client.post('/api/auth/change-password', headers=headers, json={
        'current_password': 'secret123',
        'new_password': 'newsecret456'
    })
    assert chg.status_code == 200
    assert chg.json()['message'] == 'Password changed successfully'

    # 11. Test Export History
    export_res = client.get('/api/history/export', headers=headers)
    assert export_res.status_code == 200
    assert export_res.json()['total_records'] == 3

    # 12. Test Clear History
    clear_res = client.post('/api/history/clear', headers=headers)
    assert clear_res.status_code == 200
    hist_after = client.get('/api/history', headers=headers)
    assert hist_after.status_code == 200
    assert len(hist_after.json()) == 0

