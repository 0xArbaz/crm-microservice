import requests

# Login first
login_resp = requests.post('http://localhost:8000/api/v1/auth/login', json={'email': 'admin@example.com', 'password': 'admin123'})
if login_resp.status_code == 200:
    token = login_resp.json()['access_token']
    print('Login OK')

    # Get leads with status=0
    headers = {'Authorization': f'Bearer {token}'}
    leads_resp = requests.get('http://localhost:8000/api/v1/leads/', params={'status': 0}, headers=headers)
    print(f'Leads API Status: {leads_resp.status_code}')
    if leads_resp.status_code == 200:
        data = leads_resp.json()
        print(f'Total leads: {data["total"]}')
        for item in data['items'][:3]:
            print(f'  ID={item["id"]}, Company={item.get("company_name")}, status={item["status"]}, lead_status={item.get("lead_status")}')
    else:
        print(f'Error: {leads_resp.text}')

    # Get pre-leads with status=0
    preleads_resp = requests.get('http://localhost:8000/api/v1/pre-leads/', params={'status': 0}, headers=headers)
    print(f'Pre-leads API Status: {preleads_resp.status_code}')
    if preleads_resp.status_code == 200:
        data = preleads_resp.json()
        print(f'Total pre-leads: {data["total"]}')
        for item in data['items'][:3]:
            print(f'  ID={item["id"]}, Company={item.get("company_name")}, status={item["status"]}')
    else:
        print(f'Error: {preleads_resp.text}')
else:
    print(f'Login failed: {login_resp.status_code} - {login_resp.text}')
