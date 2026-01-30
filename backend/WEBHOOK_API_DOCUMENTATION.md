# Webhook API Documentation

This document describes all available webhook endpoints for the CRM Microservice. All webhook endpoints are accessible at `/api/v1/webhooks/`.

## Base URL
```
http://localhost:8000/api/v1/webhooks
```

## Authentication
Webhooks support optional HMAC-SHA256 signature verification. Include the signature in the `X-Webhook-Signature` header.

## Common Request Format
All incoming webhooks use the same request format:
```json
{
  "event": "event_name",
  "source": "external_system_name",
  "data": {
    // Event-specific data
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "optional_hmac_signature"
}
```

## Common Response Format
```json
{
  "status": "success",
  "message": "Description of what happened",
  "data": {
    // Response data
  }
}
```

---

# Pre-Lead Webhook APIs

## 1. Create Pre-Lead
Creates a new pre-lead from an external inquiry.

**Endpoint:** `POST /incoming/pre-lead/create`

**Event:** `new_inquiry`

**Request:**
```json
{
  "event": "new_inquiry",
  "source": "website",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "company_name": "ABC Corp",
    "source": "website",
    "product_interest": "CRM Software",
    "requirements": "Need enterprise CRM solution",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "address_line1": "123 Main St",
    "address_line2": "Suite 100",
    "zip_code": "10001",
    "notes": "Interested in demo",
    "lead_status": "new",
    "industry_id": 1,
    "region_id": 1,
    "office_timings": "9:00 AM - 5:00 PM",
    "timezone": "EST"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Pre-lead created successfully",
  "data": {
    "pre_lead_id": 123
  }
}
```

---

## 2. Update Pre-Lead
Updates an existing pre-lead.

**Endpoint:** `POST /incoming/pre-lead/{pre_lead_id}/update`

**Event:** `pre_lead_update`

**Request:**
```json
{
  "event": "pre_lead_update",
  "source": "erp",
  "data": {
    "first_name": "John",
    "last_name": "Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567891",
    "company_name": "ABC Corp Updated",
    "product_interest": "Enterprise CRM",
    "requirements": "Updated requirements",
    "city": "Los Angeles",
    "state": "CA",
    "lead_status": "contacted",
    "notes": "Follow up scheduled"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Pre-lead updated successfully",
  "data": {
    "pre_lead_id": 123
  }
}
```

---

## 3. Discard Pre-Lead
Discards/archives a pre-lead.

**Endpoint:** `POST /incoming/pre-lead/{pre_lead_id}/discard`

**Event:** `pre_lead_discard`

**Request:**
```json
{
  "event": "pre_lead_discard",
  "source": "crm",
  "data": {
    "reason": "Not interested - budget constraints"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Pre-lead discarded successfully",
  "data": {
    "pre_lead_id": 123
  }
}
```

---

## 4. Add Contact to Pre-Lead
Adds a new contact person to a pre-lead.

**Endpoint:** `POST /incoming/pre-lead/{pre_lead_id}/contact/add`

**Event:** `pre_lead_contact_add`

**Request:**
```json
{
  "event": "pre_lead_contact_add",
  "source": "website",
  "data": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@abccorp.com",
    "phone": "+1234567892",
    "designation": "Procurement Manager",
    "department": "Purchasing",
    "is_primary": true
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Contact added successfully",
  "data": {
    "contact_id": 456,
    "pre_lead_id": 123
  }
}
```

---

## 5. Add Memo to Pre-Lead
Adds a memo/note to a pre-lead.

**Endpoint:** `POST /incoming/pre-lead/{pre_lead_id}/memo/add`

**Event:** `pre_lead_memo_add`

**Request:**
```json
{
  "event": "pre_lead_memo_add",
  "source": "crm",
  "data": {
    "title": "Initial Call Summary",
    "content": "Discussed requirements. Client needs enterprise solution with 500+ users.",
    "memo_type": "call"
  }
}
```

**Memo Types:** `general`, `follow_up`, `meeting`, `call`, `email`

**Response:**
```json
{
  "status": "success",
  "message": "Memo added successfully",
  "data": {
    "memo_id": 789,
    "pre_lead_id": 123
  }
}
```

---

## 6. Update Pre-Lead Status
Updates the status of a pre-lead with history tracking.

**Endpoint:** `POST /incoming/pre-lead/{pre_lead_id}/status/update`

**Event:** `pre_lead_status_update`

**Request:**
```json
{
  "event": "pre_lead_status_update",
  "source": "crm",
  "data": {
    "lead_status": "qualified",
    "remarks": "Qualified after initial assessment"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Pre-lead status updated successfully",
  "data": {
    "pre_lead_id": 123,
    "old_status": "new",
    "new_status": "qualified"
  }
}
```

---

## 7. Convert Pre-Lead to Lead
Converts a qualified pre-lead into a lead.

**Endpoint:** `POST /incoming/pre-lead/{pre_lead_id}/convert`

**Event:** `pre_lead_convert`

**Request:**
```json
{
  "event": "pre_lead_convert",
  "source": "crm",
  "data": {
    "priority": "high",
    "assigned_to": 5,
    "expected_value": 50000.00,
    "notes": "High value prospect - prioritize follow-up"
  }
}
```

**Priority Values:** `low`, `medium`, `high`, `critical`

**Response:**
```json
{
  "status": "success",
  "message": "Pre-lead converted to lead successfully",
  "data": {
    "pre_lead_id": 123,
    "lead_id": 456
  }
}
```

---

# Lead Webhook APIs

## 1. Create Lead
Creates a new lead directly.

**Endpoint:** `POST /incoming/lead/create`

**Event:** `new_lead`

**Request:**
```json
{
  "event": "new_lead",
  "source": "website",
  "data": {
    "first_name": "Robert",
    "last_name": "Johnson",
    "email": "robert@example.com",
    "phone": "+1234567893",
    "company_name": "XYZ Industries",
    "source": "referral",
    "priority": "high",
    "product_interest": "Enterprise Suite",
    "requirements": "Full ERP integration needed",
    "expected_value": 100000.00,
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "address_line1": "456 Business Ave",
    "zip_code": "60601",
    "assigned_to": 3,
    "notes": "Referred by existing customer"
  }
}
```

**Source Values:** `website`, `referral`, `social_media`, `cold_call`, `walk_in`, `whatsapp`, `email`, `erp`, `direct`, `other`

**Response:**
```json
{
  "status": "success",
  "message": "Lead created successfully",
  "data": {
    "lead_id": 789
  }
}
```

---

## 2. Update Lead
Updates an existing lead.

**Endpoint:** `POST /incoming/lead/{lead_id}/update`

**Event:** `lead_update`

**Request:**
```json
{
  "event": "lead_update",
  "source": "erp",
  "data": {
    "first_name": "Robert",
    "last_name": "Johnson Jr.",
    "company_name": "XYZ Industries Inc.",
    "designation": "CEO",
    "company_size": "500-1000",
    "product_interest": "Enterprise Suite + Support",
    "expected_value": 150000.00,
    "lead_status": "proposal_sent",
    "priority": "critical",
    "notes": "Updated contact information"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Lead updated successfully",
  "data": {
    "lead_id": 789
  }
}
```

---

## 3. Discard Lead
Discards/archives a lead.

**Endpoint:** `POST /incoming/lead/{lead_id}/discard`

**Event:** `lead_discard`

**Request:**
```json
{
  "event": "lead_discard",
  "source": "crm",
  "data": {
    "reason": "Lost to competitor",
    "loss_reason": "Price too high - went with cheaper alternative"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Lead discarded successfully",
  "data": {
    "lead_id": 789
  }
}
```

---

## 4. Add Contact to Lead
Adds a new contact person to a lead.

**Endpoint:** `POST /incoming/lead/{lead_id}/contact/add`

**Event:** `lead_contact_add`

**Request:**
```json
{
  "event": "lead_contact_add",
  "source": "crm",
  "data": {
    "first_name": "Sarah",
    "last_name": "Williams",
    "email": "sarah@xyzindustries.com",
    "phone": "+1234567894",
    "designation": "CTO",
    "department": "Technology",
    "is_primary": false
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Contact added successfully",
  "data": {
    "contact_id": 101,
    "lead_id": 789
  }
}
```

---

## 5. Add Activity to Lead
Logs an activity (call, email, meeting, etc.) for a lead.

**Endpoint:** `POST /incoming/lead/{lead_id}/activity/add`

**Event:** `lead_activity_add`

**Request:**
```json
{
  "event": "lead_activity_add",
  "source": "crm",
  "data": {
    "activity_type": "meeting",
    "title": "Product Demo",
    "description": "Conducted full product demonstration for technical team",
    "scheduled_at": "2024-01-20T14:00:00Z",
    "completed_at": "2024-01-20T15:30:00Z",
    "outcome": "Positive feedback, moving to proposal stage"
  }
}
```

**Activity Types:** `call`, `email`, `meeting`, `task`, `note`

**Response:**
```json
{
  "status": "success",
  "message": "Activity added successfully",
  "data": {
    "activity_id": 202,
    "lead_id": 789
  }
}
```

---

## 6. Update Qualified Lead Profile
Updates or creates the qualified lead profile with detailed qualification data.

**Endpoint:** `POST /incoming/lead/{lead_id}/qualified-profile/update`

**Event:** `lead_qualified_profile_update`

**Request:**
```json
{
  "event": "lead_qualified_profile_update",
  "source": "crm",
  "data": {
    "profile_type": "qualified",
    "company": "XYZ Industries",
    "industry": "Manufacturing",
    "best_time_call": "10:00 AM - 12:00 PM",
    "timezone": "CST",
    "mode": "hybrid",
    "contact_name": "Robert Johnson",
    "designation": "CEO",
    "phone": "+1234567893",
    "email": "robert@xyzindustries.com",
    "need_type": "New Implementation",
    "current_solution": "Legacy ERP System",
    "pain_point": "Manual processes, lack of integration",
    "budget": 150000.00,
    "decision_timeline": "Q2 2024",
    "decision_maker": "Board of Directors",
    "competitor_info": "Evaluating SAP and Oracle",
    "notes": "Strong buying signals, ready to proceed"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Qualified profile updated successfully",
  "data": {
    "lead_id": 789,
    "profile_id": 303
  }
}
```

---

## 7. Add Memo to Lead
Adds a memo/note to a lead.

**Endpoint:** `POST /incoming/lead/{lead_id}/memo/add`

**Event:** `lead_memo_add`

**Request:**
```json
{
  "event": "lead_memo_add",
  "source": "crm",
  "data": {
    "title": "Negotiation Update",
    "content": "Client requested 10% discount. Approved by sales manager.",
    "memo_type": "general"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Memo added successfully",
  "data": {
    "memo_id": 404,
    "lead_id": 789
  }
}
```

---

## 8. Update Lead Status
Updates the lead status with history tracking.

**Endpoint:** `POST /incoming/lead/{lead_id}/status/update`

**Event:** `lead_status_update`

**Request:**
```json
{
  "event": "lead_status_update",
  "source": "crm",
  "data": {
    "lead_status": "negotiation",
    "remarks": "Final pricing discussion",
    "status_date": "2024-01-25T09:00:00Z"
  }
}
```

**Lead Status Values:** `new`, `contacted`, `qualified`, `proposal_sent`, `negotiation`, `won`, `lost`

**Response:**
```json
{
  "status": "success",
  "message": "Lead status updated successfully",
  "data": {
    "lead_id": 789,
    "old_status": "proposal_sent",
    "new_status": "negotiation"
  }
}
```

---

## 9. Convert Lead to Customer
Converts a won lead into a customer.

**Endpoint:** `POST /incoming/lead/{lead_id}/convert`

**Event:** `lead_convert`

**Request:**
```json
{
  "event": "lead_convert",
  "source": "crm",
  "data": {
    "customer_code": "CUST-XYZ-001",
    "credit_limit": 100000.00,
    "payment_terms": "Net 30",
    "notes": "VIP customer - premium support"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Lead converted to customer successfully",
  "data": {
    "lead_id": 789,
    "customer_id": 505,
    "customer_code": "CUST-XYZ-001"
  }
}
```

---

# Generic Webhook Endpoint

For simpler integrations, use the generic endpoint that routes based on event type.

**Endpoint:** `POST /incoming`

**Supported Events:**

### Pre-Lead Events
| Event | Description |
|-------|-------------|
| `new_inquiry` | Create new pre-lead |
| `pre_lead_update` | Update pre-lead (requires `pre_lead_id` in data) |
| `pre_lead_discard` | Discard pre-lead |
| `pre_lead_contact_add` | Add contact |
| `pre_lead_memo_add` | Add memo |
| `pre_lead_status_update` | Update status |
| `pre_lead_convert` | Convert to lead |

### Lead Events
| Event | Description |
|-------|-------------|
| `new_lead` | Create new lead |
| `lead_update` | Update lead (requires `lead_id` in data) |
| `lead_discard` | Discard lead |
| `lead_contact_add` | Add contact |
| `lead_activity_add` | Add activity |
| `lead_qualified_profile_update` | Update qualified profile |
| `lead_memo_add` | Add memo |
| `lead_status_update` | Update status |
| `lead_convert` | Convert to customer |

### Other Events
| Event | Description |
|-------|-------------|
| `order_created` | Update customer order stats |
| `payment_received` | Update customer payment info |

---

# Error Responses

## 400 Bad Request
```json
{
  "detail": "lead_status is required"
}
```

## 401 Unauthorized
```json
{
  "detail": "Invalid signature"
}
```

## 404 Not Found
```json
{
  "detail": "Lead not found"
}
```

## 500 Internal Server Error
```json
{
  "detail": "Error message description"
}
```

---

# Webhook Signature Verification

To verify webhook authenticity, compute HMAC-SHA256 of the request body using your secret key:

```python
import hmac
import hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

Include the signature in the `X-Webhook-Signature` header.

---

# Webhook Logs

All webhook calls are logged for debugging and auditing purposes.

## List Webhook Logs
**Endpoint:** `GET /logs`

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `direction`: Filter by direction (`incoming`, `outgoing`)
- `is_successful`: Filter by success status (`true`, `false`)

## Get Single Log
**Endpoint:** `GET /logs/{log_id}`

---

# Rate Limits

- Maximum 100 requests per minute per IP
- Maximum payload size: 1MB

---

# Testing

Use the Swagger documentation at `/docs` to test all endpoints interactively.

Example cURL request:
```bash
curl -X POST "http://localhost:8000/api/v1/webhooks/incoming/lead/create" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: your_signature_here" \
  -d '{
    "event": "new_lead",
    "source": "test",
    "data": {
      "first_name": "Test",
      "email": "test@example.com",
      "company_name": "Test Company"
    }
  }'
```
