# Lead Enrichment API — CRM Integration Guide

This document is a complete API reference for integrating the AI Lead Agent's enrichment and verification system into a CRM application (Python FastAPI backend + Next.js frontend). Feed this to Claude or any AI to generate the integration code.

---

## Base URL

```
http://localhost:8001
```

Production: Replace with your deployed API URL.

---

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/leads/search` | Discover new leads + optionally enrich them in one call |
| `POST` | `/leads/enrich` | Synchronous enrichment (1-50 leads, blocks until done) |
| `POST` | `/leads/enrich/bulk` | Async bulk enrichment (1-1000 leads, background processing) |
| `GET` | `/leads/enrich/bulk/{job_id}` | Check bulk job progress |
| `GET` | `/leads/enrich/bulk/{job_id}/results` | Fetch results (paginated, filterable) |
| `GET` | `/leads/enrich/bulk` | List all bulk jobs |
| `DELETE` | `/leads/enrich/bulk/{job_id}` | Delete a bulk job and its results |
| `GET` | `/` | Health check — returns `{"message": "API is online"}` |

---

## 1. POST /leads/enrich — Standalone Enrichment

**Use this when:** You have leads already in your CRM and want to fill missing data (email, phone, address, contacts) and/or verify existing data.

### Request

```
POST /leads/enrich
Content-Type: application/json
```

### Request Body Schema

```json
{
  "leads": [
    {
      "company_name": "string (REQUIRED)",
      "website": "string (optional, but greatly improves enrichment)",
      "email": "string (optional — existing email to verify)",
      "phone": "string (optional — existing phone to verify)",
      "location": "string (optional — existing address)",
      "contact_name": "string (optional)",
      "contact_title": "string (optional)",
      "extra": { "any_key": "any_value" }
    }
  ],
  "enrich_fields": ["email", "phone", "address", "contact_name", "contact_title"],
  "verify_existing": true,
  "verify_deliverability": false,
  "enrichment_providers": ["auto"],
  "skip_verified": false,
  "max_concurrent": 5
}
```

### Request Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `leads` | array | YES | — | Array of lead objects. Min: 1, Max: 50 per request. |
| `leads[].company_name` | string | YES | — | Company name. This is the only required field per lead. |
| `leads[].website` | string | no | `""` | Company website URL or bare domain (e.g., `"acme.com"` or `"https://acme.com"`). **Providing a website dramatically improves enrichment results** because Tier 1 (free scraping) and Tier 3 (Hunter.io domain search) both depend on it. |
| `leads[].email` | string | no | `""` | Pre-existing email. If provided and `verify_existing=true`, format will be validated. If `verify_deliverability=true`, SMTP deliverability will be checked. |
| `leads[].phone` | string | no | `""` | Pre-existing phone. Any format accepted (will be normalized to E.164). |
| `leads[].location` | string | no | `""` | Pre-existing address/location. |
| `leads[].contact_name` | string | no | `""` | Contact person full name. |
| `leads[].contact_title` | string | no | `""` | Contact person job title. |
| `leads[].extra` | object | no | `null` | Any additional CRM fields to pass through. These are preserved in the response untouched. Use this for your internal IDs, tags, pipeline stage, etc. |
| `enrich_fields` | array | no | all fields | Which fields to attempt enrichment on. Options: `"email"`, `"phone"`, `"address"`, `"contact_name"`, `"contact_title"`. Omit to enrich all. |
| `verify_existing` | bool | no | `true` | Run format validation on all contact data (email regex, phone E.164, address structure). Free and instant. |
| `verify_deliverability` | bool | no | `false` | Run deliverability checks: email SMTP verification (ZeroBounce/Hunter), phone line type (NumVerify/Twilio), address geocoding (Google/SmartyStreets). **Requires API keys configured in `.env`.** |
| `enrichment_providers` | array | no | `["auto"]` | Provider strategy. See Provider Strategy section below. |
| `skip_verified` | bool | no | `false` | If `true`, skip leads that already have all `enrich_fields` filled. Useful for re-enrichment to avoid wasting API calls. |
| `max_concurrent` | int | no | `5` | Max parallel enrichment tasks (1-20). Lower = slower but fewer rate limit issues. |

### Provider Strategy Options

| Value | What It Does | API Cost |
|-------|--------------|----------|
| `["auto"]` | Full waterfall: website scraping → existing providers (Apollo/Lusha/Clearbit/ZoomInfo) → specialized APIs (Hunter/RocketReach/Snov/Dropcontact). Stops per field as soon as data is found. | Varies |
| `["scrape_only"]` | Only scrapes the company website. No external API calls. | Free |
| `["hunter"]` | Only use Hunter.io for email enrichment. | Per-lookup |
| `["apollo"]` | Only use Apollo for enrichment. | Per-lookup |
| `["hunter", "apollo"]` | Try Hunter.io first, then Apollo. | Per-lookup |
| `["website_scrape", "hunter"]` | Scrape website first, then try Hunter if still missing. | Partially free |

You can combine any of: `website_scrape`, `apollo`, `lusha`, `clearbit`, `zoominfo`, `hunter`, `snov`, `rocketreach`, `dropcontact`.

### Response Schema (200 OK)

```json
{
  "status": "success",
  "summary": {
    "total_leads": 3,
    "enriched": 2,
    "skipped": 0,
    "verified": 2,
    "providers_strategy": ["auto"]
  },
  "leads": [
    {
      "company_name": "Acme Corp",
      "website": "https://acme.com",

      "email": "john.doe@acme.com",
      "email_source": "hunter",
      "phone": "+1-212-555-1234",
      "phone_source": "website_scrape",
      "address": "123 Main St, New York, NY 10001",
      "address_source": "website_scrape",
      "location": "New York, NY",

      "contact_name": "John Doe",
      "contact_name_source": "website_scrape",
      "contact_title": "CEO",
      "contact_title_source": "apollo",

      "linkedin": "https://linkedin.com/company/acme",
      "company_size": "50",
      "industry": "Technology",

      "format_validation": {
        "email": {
          "valid": true,
          "email": "john.doe@acme.com",
          "reason": "Valid email format",
          "warnings": [],
          "is_disposable": false,
          "is_role_based": false
        },
        "phone": {
          "valid": true,
          "phone": "+1-212-555-1234",
          "normalized": "+12125551234",
          "national_format": "(212) 555-1234",
          "country_code": "US",
          "reason": "Valid phone number",
          "warnings": [],
          "is_fake": false
        },
        "address": {
          "valid": true,
          "address": "123 Main St, New York, NY 10001",
          "reason": "Valid address format",
          "warnings": [],
          "has_street": true,
          "has_city_state": true,
          "is_po_box": false
        }
      },

      "email_verification": {
        "email": "john.doe@acme.com",
        "status": "valid",
        "deliverable": true,
        "source": "zerobounce",
        "confidence": 95,
        "details": {
          "smtp_check": true,
          "mx_records": true,
          "is_catch_all": false,
          "is_disposable": false,
          "is_role_based": false,
          "did_you_mean": null,
          "provider": "gmail"
        }
      },

      "phone_verification": {
        "phone": "+12125551234",
        "valid": true,
        "source": "numverify",
        "line_type": "landline",
        "carrier": "Verizon",
        "location": "New York",
        "country_code": "US",
        "confidence": 90
      },

      "address_verification": {
        "address": "123 Main St, New York, NY 10001",
        "standardized": "123 Main St, New York, NY 10001-2345",
        "valid": true,
        "source": "google",
        "coordinates": { "lat": 40.7484, "lng": -73.9967 },
        "components": {
          "street_number": "123",
          "street": "Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001",
          "country": "United States",
          "country_code": "US"
        },
        "confidence": 95
      },

      "enrichment_metadata": {
        "enriched_at": "2025-01-15T10:30:00.123456+00:00",
        "fields_enriched": ["email", "phone", "contact_title"],
        "fields_still_missing": [],
        "fields_failed": [],
        "providers_used": ["website_scrape", "hunter", "apollo"],
        "total_api_calls": 4,
        "enrichment_duration_ms": 3200
      },

      "extra": { "crm_id": "lead_12345", "pipeline_stage": "new" }
    }
  ]
}
```

### Response Field Reference

**Top Level:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"success"` on 200 |
| `summary.total_leads` | int | Total leads in response |
| `summary.enriched` | int | Leads that had at least one field filled |
| `summary.skipped` | int | Leads skipped because all fields were already filled (when `skip_verified=true`) |
| `summary.verified` | int | Leads that had deliverability checks run |
| `leads` | array | Array of enriched lead objects |

**Per Lead — Core Data:**

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `company_name` | string | yes | Company name |
| `website` | string | yes | Company website |
| `email` | string | yes | Email (enriched or original). Empty string if not found. |
| `phone` | string | yes | Phone (enriched or original). Empty string if not found. |
| `location` | string | yes | Location/address |
| `contact_name` | string | yes | Contact person name |
| `contact_title` | string | yes | Contact person title |

**Per Lead — Source Tracking:**

These fields tell you WHERE each piece of data came from. Only present for fields that were enriched (not for original data).

| Field | Type | Description |
|-------|------|-------------|
| `email_source` | string | Where the email was found: `"website_scrape"`, `"hunter"`, `"apollo"`, `"lusha"`, `"rocketreach"`, etc. |
| `phone_source` | string | Where the phone was found |
| `address_source` | string | Where the address was found |
| `contact_name_source` | string | Where the contact name was found |
| `contact_title_source` | string | Where the contact title was found |

**Per Lead — Format Validation (`format_validation`):**

Present when `verify_existing=true`. Contains validation results for each contact field.

| Field | Type | Description |
|-------|------|-------------|
| `format_validation.email.valid` | bool | Email passes format check |
| `format_validation.email.reason` | string | Human-readable validation result |
| `format_validation.email.warnings` | array | Warnings (e.g., `"Disposable email domain"`) |
| `format_validation.email.is_disposable` | bool | Uses a throwaway email domain (mailinator, etc.) |
| `format_validation.email.is_role_based` | bool | Generic prefix like info@, admin@, support@ |
| `format_validation.phone.valid` | bool | Phone passes format + E.164 check |
| `format_validation.phone.normalized` | string | E.164 format (e.g., `"+12125551234"`) — **use this for storage** |
| `format_validation.phone.national_format` | string | Human-readable (e.g., `"(212) 555-1234"`) — **use this for display** |
| `format_validation.phone.country_code` | string | ISO country code (e.g., `"US"`) |
| `format_validation.phone.is_fake` | bool | Matches known fake pattern (all zeros, 555 numbers, etc.) |
| `format_validation.address.valid` | bool | Has minimum address components |
| `format_validation.address.has_street` | bool | Contains street-like component |
| `format_validation.address.has_city_state` | bool | Contains city/state/country |
| `format_validation.address.is_po_box` | bool | Address is a PO Box |

**Per Lead — Deliverability Verification:**

Present only when `verify_deliverability=true` AND the corresponding API keys are configured.

| Field | Type | Description |
|-------|------|-------------|
| `email_verification.status` | string | `"valid"`, `"invalid"`, `"catch-all"`, `"unknown"` |
| `email_verification.deliverable` | bool | **Key field: Can emails actually be delivered?** |
| `email_verification.confidence` | int | 0-100 confidence score |
| `email_verification.source` | string | `"zerobounce"`, `"hunter"`, `"none"` |
| `email_verification.details.smtp_check` | bool | SMTP server responded positively |
| `email_verification.details.mx_records` | bool | Domain has MX records |
| `email_verification.details.is_catch_all` | bool | Domain accepts all emails (less reliable) |
| `email_verification.details.did_you_mean` | string\|null | Typo suggestion (e.g., `"gmail.com"` instead of `"gmial.com"`) |
| `phone_verification.valid` | bool | **Key field: Is the phone number active?** |
| `phone_verification.line_type` | string | `"mobile"`, `"landline"`, `"voip"`, `"unknown"` |
| `phone_verification.carrier` | string | Carrier name (e.g., `"Verizon"`) |
| `phone_verification.confidence` | int | 0-100 confidence score |
| `address_verification.valid` | bool | **Key field: Does the address exist?** |
| `address_verification.standardized` | string | Corrected/standardized address — **use this for storage** |
| `address_verification.coordinates` | object | `{"lat": float, "lng": float}` — useful for map display |
| `address_verification.components` | object | Parsed address parts: `street_number`, `street`, `city`, `state`, `zip`, `country`, `country_code` |
| `address_verification.confidence` | int | 0-100 confidence score |

**Per Lead — Enrichment Metadata:**

| Field | Type | Description |
|-------|------|-------------|
| `enrichment_metadata.enriched_at` | string | ISO 8601 timestamp |
| `enrichment_metadata.fields_enriched` | array | Fields that were successfully filled: `["email", "phone"]` |
| `enrichment_metadata.fields_still_missing` | array | Fields that remain empty after all tiers |
| `enrichment_metadata.fields_failed` | array | Same as fields_still_missing |
| `enrichment_metadata.providers_used` | array | Which providers were actually called: `["website_scrape", "hunter"]` |
| `enrichment_metadata.total_api_calls` | int | Total API/page requests made |
| `enrichment_metadata.enrichment_duration_ms` | int | Time spent enriching this lead in milliseconds |

### Error Responses

| Status | When | Body |
|--------|------|------|
| `400` | Empty leads array or invalid request | `{"detail": "No leads provided for enrichment"}` |
| `422` | Missing required field (company_name) or type errors | Pydantic validation error |

---

## 2. POST /leads/enrich/bulk — Async Bulk Enrichment

**Use this when:** You need to enrich 50-1000 leads from your CRM database. The API processes them in the background and you poll for progress.

### Flow

```
Step 1: POST /leads/enrich/bulk        → returns { job_id: "abc123" }
Step 2: GET  /leads/enrich/bulk/abc123  → returns { progress_percent: 45, status: "processing" }
Step 3: GET  /leads/enrich/bulk/abc123  → returns { progress_percent: 100, status: "completed" }
Step 4: GET  /leads/enrich/bulk/abc123/results?page=1&page_size=50  → returns enriched leads
```

### Step 1: Submit Bulk Job

```
POST /leads/enrich/bulk
Content-Type: application/json
```

```json
{
  "leads": [
    {"company_name": "Acme Corp", "website": "acme.com", "extra": {"crm_id": "1"}},
    {"company_name": "Beta Inc", "website": "beta.io", "extra": {"crm_id": "2"}},
    {"company_name": "Gamma LLC", "website": "gamma.co", "email": "info@gamma.co", "extra": {"crm_id": "3"}}
  ],
  "enrich_fields": ["email", "phone", "address", "contact_name", "contact_title"],
  "verify_existing": true,
  "verify_deliverability": false,
  "enrichment_providers": ["auto"],
  "skip_verified": false,
  "max_concurrent": 5,
  "chunk_size": 25
}
```

**Request Fields (same as /leads/enrich, plus):**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `leads` | array | — | **Max 1000 leads** (vs 50 for sync endpoint) |
| `chunk_size` | int | `25` | Leads per internal processing chunk (5-50). Lower = more frequent progress updates. Higher = slightly faster. |

**Response (202-like immediate return):**

```json
{
  "status": "accepted",
  "job_id": "a1b2c3d4e5f6",
  "total_leads": 500,
  "to_enrich": 480,
  "skipped": 20,
  "total_chunks": 20,
  "chunk_size": 25,
  "message": "Bulk enrichment started. Poll GET /leads/enrich/bulk/a1b2c3d4e5f6 for progress."
}
```

### Step 2: Poll Progress

```
GET /leads/enrich/bulk/{job_id}
```

**Response:**

```json
{
  "job_id": "a1b2c3d4e5f6",
  "status": "processing",
  "progress_percent": 45,
  "total_leads": 500,
  "processed": 225,
  "enriched": 180,
  "failed": 5,
  "skipped": 20,
  "current_chunk": 9,
  "total_chunks": 20,
  "created_at": "2025-01-15T10:30:00+00:00",
  "updated_at": "2025-01-15T10:32:15+00:00",
  "completed_at": null,
  "errors": [],
  "config": {
    "enrich_fields": ["email", "phone", "address", "contact_name", "contact_title"],
    "enrichment_providers": ["auto"],
    "chunk_size": 25
  }
}
```

**Status values:**

| Status | Meaning |
|--------|---------|
| `pending` | Job created, waiting to start |
| `processing` | Actively enriching leads |
| `completed` | All leads processed |
| `failed` | Job failed (check `errors` array) |
| `cancelled` | Job was cancelled |

### Step 3: Fetch Results (paginated)

```
GET /leads/enrich/bulk/{job_id}/results?page=1&page_size=50
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number (1-based) |
| `page_size` | int | `50` | Results per page (1-200) |
| `only_enriched` | bool | `false` | Only return leads that had fields enriched |
| `only_with_email` | bool | `false` | Only return leads that have an email |
| `only_with_phone` | bool | `false` | Only return leads that have a phone |

**Response:**

```json
{
  "job_id": "a1b2c3d4e5f6",
  "status": "completed",
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_results": 480,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  },
  "leads": [
    {
      "company_name": "Acme Corp",
      "email": "john@acme.com",
      "email_source": "hunter",
      "phone": "+1-212-555-1234",
      "phone_source": "website_scrape",
      "enrichment_metadata": { "fields_enriched": ["email", "phone"], "providers_used": ["website_scrape", "hunter"] },
      "format_validation": { ... },
      "extra": {"crm_id": "1"}
    }
  ]
}
```

**Note:** Results are available as they complete — you can fetch partial results while `status` is still `"processing"`.

### List All Jobs

```
GET /leads/enrich/bulk?limit=20
```

**Response:**

```json
{
  "status": "success",
  "total_jobs": 3,
  "jobs": [
    {
      "job_id": "a1b2c3d4e5f6",
      "status": "completed",
      "created_at": "2025-01-15T10:30:00+00:00",
      "completed_at": "2025-01-15T10:35:00+00:00",
      "total_leads": 500,
      "processed": 500,
      "enriched": 380,
      "failed": 10,
      "skipped": 20,
      "progress_percent": 100
    }
  ]
}
```

### Delete a Job

```
DELETE /leads/enrich/bulk/{job_id}
```

Returns `{"status": "deleted", "job_id": "..."}`. Cannot delete a job with `status: "processing"`.

---

## 3. GET /leads/search — Discovery with Inline Enrichment

**Use this when:** You want to discover new leads AND enrich them in a single API call.

### Request

```
GET /leads/search?industry=Dentists&location=New York&ai_engine=Gemini&enrich=true&verify=true
```

### Query Parameters

**Required:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `industry` | string | Target industry (e.g., `"Dentists"`, `"SaaS"`, `"Real Estate"`) |
| `location` | string | Target location (e.g., `"New York, NY"`, `"California"`, `"United States"`) |
| `ai_engine` | string | AI engine for scoring. One of: `Claude`, `ChatGPT`, `Gemini`, `Groq` |

**Discovery Mode (choose one or omit for AI-only):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform_sources` | array | Mode 1 — Platforms to scrape: `LinkedIn`, `Yelp`, `YellowPages`, `Crunchbase`, or custom URLs |
| `data_provider_source` | string | Mode 2 — Data provider: `Apollo`, `Lusha`, `Clearbit`, or `ZoomInfo` (only ONE) |
| _(neither)_ | — | Mode 3 — AI discovers leads from its knowledge |

**Filtering:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `min_score` | int | `7` | Minimum relevance score (0-10). Only leads scoring >= this are returned. |
| `exclude_empty_contacts` | bool | `false` | Exclude leads that have neither email nor phone |
| `exclude_location` | array | `null` | Exclude leads from specific locations (e.g., `["California", "Texas"]`) |
| `semantic_search` | string | from `.env` | Validation mode: `off`, `fast`, `ai` |
| `job_title` | string | `null` | Filter by job title |
| `keywords` | string | `null` | Additional keywords |

**Enrichment (new):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enrich` | bool | `false` | **Set to `true` to enable enrichment.** Fills missing email, phone, address, contacts for all discovered leads. |
| `verify` | bool | `false` | **Set to `true` to enable deliverability verification.** Runs email SMTP check, phone line type, address geocoding. |
| `enrich_providers` | string | `"auto"` | Provider strategy: `"auto"`, `"scrape_only"`, or comma-separated: `"hunter,apollo"` |

### Response Schema (200 OK)

```json
{
  "status": "success",
  "discovery_mode": "ai_only",
  "ai_engine": "Gemini",
  "search_metadata": {
    "industry": "Dentists",
    "location": "New York, NY",
    "discovery_sources": ["Gemini"],
    "total_found": 8,
    "errors_encountered": 0
  },
  "leads": [
    {
      "ai_engine": "Gemini",
      "source": "AI",
      "discovery_mode": "ai_only",
      "confidence_score": 90,
      "validated_by_ai": true,

      "company_name": "NYC Dental Group",
      "website": "https://nycdental.com",
      "snippet": "Leading dental practice in Manhattan...",
      "industry": "Dentists",
      "location": "123 Park Ave, New York, NY 10001",

      "email": "info@nycdental.com",
      "phone": "(212) 555-0100",
      "extracted_email": null,
      "extracted_phone": null,

      "score": 9,
      "reason": "Highly relevant dental practice in target location",

      "company_size": "",
      "linkedin": "https://linkedin.com/company/nycdental",
      "contact_name": "Dr. Jane Smith",
      "contact_title": "Lead Dentist",

      "semantic_validation": {},

      "format_validation": { ... },
      "email_verification": { ... },
      "phone_verification": { ... },
      "address_verification": { ... },
      "enrichment_metadata": { ... }
    }
  ]
}
```

The `leads` array items include all the same enrichment/verification fields documented above in the POST /leads/enrich response, PLUS these discovery-specific fields:

| Field | Type | Description |
|-------|------|-------------|
| `ai_engine` | string | Which AI engine scored this lead |
| `source` | string | Where the lead was discovered: `"AI"`, `"Yelp"`, `"Apollo"`, etc. |
| `discovery_mode` | string | `"platform"`, `"data_provider"`, or `"ai_only"` |
| `confidence_score` | int | 0-100 (score * 10) |
| `validated_by_ai` | bool | Always `true` |
| `snippet` | string | Description/context about the lead |
| `score` | int | 0-10 relevance score from AI |
| `reason` | string | AI's explanation of the score |
| `extracted_email` | string\|null | Email found via regex during discovery (before enrichment) |
| `extracted_phone` | string\|null | Phone found via regex during discovery (before enrichment) |

### Error Responses

| Status | When | Body |
|--------|------|------|
| `400` | Invalid `ai_engine`, invalid source combination, invalid `semantic_search` mode | `{"detail": "error description"}` |
| `404` | No leads found | `{"detail": "No business leads found using {mode} discovery."}` |
| `207` | Leads found but all failed AI scoring | `{"status": "error", "message": "...", "details": [...]}` |
| `500` | Discovery process crashed | `{"detail": "Discovery failed: {error}"}` |

---

## 4. CRM Integration Patterns

### Pattern A: Enrich leads on import (Backend — Python FastAPI)

When a new lead is added to the CRM, call the enrichment API to fill missing data.

```python
import httpx

ENRICHMENT_API = "http://localhost:8001"

async def enrich_new_lead(lead_from_crm: dict) -> dict:
    """Call enrichment API when a lead is created/imported into CRM."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{ENRICHMENT_API}/leads/enrich",
            json={
                "leads": [{
                    "company_name": lead_from_crm["company_name"],
                    "website": lead_from_crm.get("website", ""),
                    "email": lead_from_crm.get("email", ""),
                    "phone": lead_from_crm.get("phone", ""),
                    "location": lead_from_crm.get("address", ""),
                    "contact_name": lead_from_crm.get("contact_name", ""),
                    "contact_title": lead_from_crm.get("contact_title", ""),
                    "extra": {"crm_id": lead_from_crm["id"]}
                }],
                "enrich_fields": ["email", "phone", "address", "contact_name", "contact_title"],
                "verify_existing": True,
                "verify_deliverability": True,
                "enrichment_providers": ["auto"]
            }
        )
        data = response.json()

        if data["status"] == "success" and data["leads"]:
            enriched = data["leads"][0]
            # Update CRM record with enriched data
            return {
                "email": enriched.get("email", ""),
                "email_verified": enriched.get("email_verification", {}).get("deliverable", False),
                "phone": enriched.get("format_validation", {}).get("phone", {}).get("normalized", enriched.get("phone", "")),
                "phone_display": enriched.get("format_validation", {}).get("phone", {}).get("national_format", enriched.get("phone", "")),
                "phone_valid": enriched.get("phone_verification", {}).get("valid", False),
                "phone_type": enriched.get("phone_verification", {}).get("line_type", ""),
                "address": enriched.get("address_verification", {}).get("standardized", enriched.get("location", "")),
                "address_lat": enriched.get("address_verification", {}).get("coordinates", {}).get("lat"),
                "address_lng": enriched.get("address_verification", {}).get("coordinates", {}).get("lng"),
                "contact_name": enriched.get("contact_name", ""),
                "contact_title": enriched.get("contact_title", ""),
                "linkedin": enriched.get("linkedin", ""),
                "enrichment_sources": enriched.get("enrichment_metadata", {}).get("providers_used", []),
            }
        return {}
```

### Pattern B: Bulk re-enrichment (Backend — Python FastAPI)

Re-enrich leads that have missing data. Run nightly or on-demand.

```python
async def bulk_enrich_crm_leads(leads_from_db: list) -> list:
    """Enrich up to 50 leads at once. Use skip_verified to avoid re-processing complete leads."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{ENRICHMENT_API}/leads/enrich",
            json={
                "leads": [
                    {
                        "company_name": lead["company_name"],
                        "website": lead.get("website", ""),
                        "email": lead.get("email", ""),
                        "phone": lead.get("phone", ""),
                        "location": lead.get("address", ""),
                        "contact_name": lead.get("contact_name", ""),
                        "contact_title": lead.get("contact_title", ""),
                        "extra": {"crm_id": lead["id"]}
                    }
                    for lead in leads_from_db
                ],
                "skip_verified": True,
                "verify_existing": True,
                "verify_deliverability": False,
                "enrichment_providers": ["auto"],
                "max_concurrent": 5
            }
        )
        return response.json().get("leads", [])
```

### Pattern C: Search + Enrich new leads (Frontend — Next.js)

Discover new leads and import enriched results into CRM.

```typescript
// Next.js API route or server action
const ENRICHMENT_API = process.env.ENRICHMENT_API_URL || "http://localhost:8001";

interface SearchParams {
  industry: string;
  location: string;
  aiEngine: "Claude" | "ChatGPT" | "Gemini" | "Groq";
  platformSources?: string[];
  dataProviderSource?: string;
  minScore?: number;
}

async function searchAndEnrichLeads(params: SearchParams) {
  const searchParams = new URLSearchParams({
    industry: params.industry,
    location: params.location,
    ai_engine: params.aiEngine,
    enrich: "true",
    verify: "true",
    enrich_providers: "auto",
    min_score: String(params.minScore ?? 7),
    exclude_empty_contacts: "true",
  });

  if (params.platformSources) {
    params.platformSources.forEach(s => searchParams.append("platform_sources", s));
  }
  if (params.dataProviderSource) {
    searchParams.set("data_provider_source", params.dataProviderSource);
  }

  const res = await fetch(`${ENRICHMENT_API}/leads/search?${searchParams}`);
  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.detail || data.message || "Search failed");
  }

  return data.leads;
}
```

### Pattern D: Enrich single lead on-demand (Frontend — Next.js)

User clicks "Enrich" button on a lead detail page.

```typescript
interface Lead {
  id: string;
  company_name: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_name?: string;
  contact_title?: string;
}

async function enrichSingleLead(lead: Lead) {
  const res = await fetch(`${ENRICHMENT_API}/leads/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leads: [{
        company_name: lead.company_name,
        website: lead.website || "",
        email: lead.email || "",
        phone: lead.phone || "",
        location: lead.address || "",
        contact_name: lead.contact_name || "",
        contact_title: lead.contact_title || "",
        extra: { crm_id: lead.id }
      }],
      verify_existing: true,
      verify_deliverability: true,
      enrichment_providers: ["auto"]
    })
  });

  const data = await res.json();
  if (data.status === "success" && data.leads?.length > 0) {
    return data.leads[0];
  }
  throw new Error("Enrichment failed");
}
```

### Pattern E: Free-only enrichment (no API costs)

When you want enrichment but don't want any paid API calls.

```json
{
  "leads": [{ "company_name": "Acme Corp", "website": "acme.com" }],
  "enrichment_providers": ["scrape_only"],
  "verify_existing": true,
  "verify_deliverability": false
}
```

### Pattern F: Bulk enrich 500 leads from CRM (Backend — Python FastAPI)

Submit a bulk job, poll for completion, then update your database.

```python
import httpx
import asyncio

ENRICHMENT_API = "http://localhost:8001"

async def bulk_enrich_from_crm(leads_from_db: list) -> list:
    """
    Enrich up to 1000 leads via background bulk job.
    Polls for completion, then fetches all results page by page.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Submit bulk job
        response = await client.post(
            f"{ENRICHMENT_API}/leads/enrich/bulk",
            json={
                "leads": [
                    {
                        "company_name": lead["company_name"],
                        "website": lead.get("website", ""),
                        "email": lead.get("email", ""),
                        "phone": lead.get("phone", ""),
                        "location": lead.get("address", ""),
                        "contact_name": lead.get("contact_name", ""),
                        "contact_title": lead.get("contact_title", ""),
                        "extra": {"crm_id": lead["id"]}
                    }
                    for lead in leads_from_db
                ],
                "enrich_fields": ["email", "phone", "address", "contact_name", "contact_title"],
                "verify_existing": True,
                "verify_deliverability": False,
                "enrichment_providers": ["auto"],
                "skip_verified": True,
                "chunk_size": 25,
                "max_concurrent": 5
            }
        )
        job = response.json()
        job_id = job["job_id"]
        print(f"Bulk job started: {job_id} ({job['to_enrich']} leads to enrich)")

        # Step 2: Poll until complete
        while True:
            await asyncio.sleep(5)  # Check every 5 seconds
            status_resp = await client.get(f"{ENRICHMENT_API}/leads/enrich/bulk/{job_id}")
            status = status_resp.json()
            print(f"  Progress: {status['progress_percent']}% ({status['processed']}/{status['total_leads']})")

            if status["status"] in ("completed", "failed"):
                break

        # Step 3: Fetch all results page by page
        all_results = []
        page = 1
        while True:
            results_resp = await client.get(
                f"{ENRICHMENT_API}/leads/enrich/bulk/{job_id}/results",
                params={"page": page, "page_size": 100}
            )
            data = results_resp.json()
            all_results.extend(data["leads"])

            if not data["pagination"]["has_next"]:
                break
            page += 1

        print(f"Fetched {len(all_results)} enriched leads")
        return all_results
```

### Pattern G: Bulk enrich with progress bar (Frontend — Next.js)

Submit bulk job and show live progress in the UI.

```typescript
const ENRICHMENT_API = process.env.ENRICHMENT_API_URL || "http://localhost:8001";

interface BulkJob {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress_percent: number;
  total_leads: number;
  processed: number;
  enriched: number;
  failed: number;
}

// Step 1: Submit bulk job
async function submitBulkEnrichment(leads: Array<{
  company_name: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  id: string;
}>): Promise<string> {
  const res = await fetch(`${ENRICHMENT_API}/leads/enrich/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leads: leads.map(lead => ({
        company_name: lead.company_name,
        website: lead.website || "",
        email: lead.email || "",
        phone: lead.phone || "",
        location: lead.address || "",
        extra: { crm_id: lead.id }
      })),
      enrich_fields: ["email", "phone", "address", "contact_name", "contact_title"],
      verify_existing: true,
      enrichment_providers: ["auto"],
      skip_verified: true,
      chunk_size: 25
    })
  });
  const data = await res.json();
  return data.job_id;
}

// Step 2: Poll progress (call this in a setInterval or React useEffect)
async function pollJobProgress(jobId: string): Promise<BulkJob> {
  const res = await fetch(`${ENRICHMENT_API}/leads/enrich/bulk/${jobId}`);
  return res.json();
}

// Step 3: Fetch results page by page
async function fetchJobResults(jobId: string, page: number = 1, pageSize: number = 50) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    only_enriched: "true"  // Only leads that got new data
  });
  const res = await fetch(`${ENRICHMENT_API}/leads/enrich/bulk/${jobId}/results?${params}`);
  return res.json();
}

// Full flow example (React hook style)
async function runBulkEnrichment(
  leads: any[],
  onProgress: (job: BulkJob) => void
): Promise<any[]> {
  // Submit
  const jobId = await submitBulkEnrichment(leads);

  // Poll until done
  while (true) {
    await new Promise(r => setTimeout(r, 3000)); // 3 second intervals
    const job = await pollJobProgress(jobId);
    onProgress(job);

    if (job.status === "completed" || job.status === "failed") break;
  }

  // Fetch all pages
  const allResults: any[] = [];
  let page = 1;
  while (true) {
    const data = await fetchJobResults(jobId, page, 100);
    allResults.push(...data.leads);
    if (!data.pagination.has_next) break;
    page++;
  }

  return allResults;
}
```

### Pattern H: Nightly bulk enrichment cron job (Backend — Python)

Run every night to enrich all leads with missing data.

```python
import httpx
import asyncio

async def nightly_enrichment_job():
    """
    Cron job: Fetch leads with missing emails from CRM DB,
    submit bulk enrichment, wait for completion, update DB.
    """
    # 1. Query your CRM database for leads missing email
    leads_missing_data = await db.fetch_all(
        "SELECT id, company_name, website, email, phone, address "
        "FROM leads WHERE email IS NULL OR email = '' LIMIT 1000"
    )

    if not leads_missing_data:
        print("No leads need enrichment")
        return

    # 2. Submit bulk job
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "http://localhost:8001/leads/enrich/bulk",
            json={
                "leads": [
                    {
                        "company_name": lead["company_name"],
                        "website": lead["website"] or "",
                        "email": lead["email"] or "",
                        "phone": lead["phone"] or "",
                        "location": lead["address"] or "",
                        "extra": {"crm_id": str(lead["id"])}
                    }
                    for lead in leads_missing_data
                ],
                "enrich_fields": ["email", "phone"],
                "enrichment_providers": ["auto"],
                "skip_verified": True,
                "chunk_size": 25
            }
        )
        job_id = resp.json()["job_id"]

        # 3. Wait for completion
        while True:
            await asyncio.sleep(10)
            status = (await client.get(f"http://localhost:8001/leads/enrich/bulk/{job_id}")).json()
            if status["status"] in ("completed", "failed"):
                break

        # 4. Fetch results and update DB
        page = 1
        updated = 0
        while True:
            data = (await client.get(
                f"http://localhost:8001/leads/enrich/bulk/{job_id}/results",
                params={"page": page, "page_size": 100, "only_enriched": "true"}
            )).json()

            for lead in data["leads"]:
                crm_id = lead.get("extra", {}).get("crm_id")
                if crm_id:
                    await db.execute(
                        "UPDATE leads SET email=:email, phone=:phone, "
                        "email_source=:email_source, phone_source=:phone_source, "
                        "enriched_at=NOW() WHERE id=:id",
                        {
                            "id": crm_id,
                            "email": lead.get("email", ""),
                            "phone": lead.get("phone", ""),
                            "email_source": lead.get("email_source", ""),
                            "phone_source": lead.get("phone_source", ""),
                        }
                    )
                    updated += 1

            if not data["pagination"]["has_next"]:
                break
            page += 1

        print(f"Nightly enrichment done: {updated} leads updated")
```

---

## 5. CRM Database Field Mapping

Recommended columns for your CRM leads table based on enrichment output:

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_source VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_deliverable BOOLEAN DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_is_catch_all BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_is_disposable BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_is_role_based BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_confidence INT DEFAULT 0;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_normalized VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_display VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_source VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_valid BOOLEAN DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_line_type VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_carrier VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_confidence INT DEFAULT 0;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_standardized TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_source VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_valid BOOLEAN DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_lat DECIMAL(10, 7);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_lng DECIMAL(10, 7);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_state VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_zip VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_country VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_confidence INT DEFAULT 0;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_name VARCHAR(200);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_title VARCHAR(200);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_source VARCHAR(50);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_providers JSON;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_fields_filled JSON;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_fields_missing JSON;
```

### Mapping Response → Database

```python
def map_enriched_lead_to_db(enriched_lead: dict) -> dict:
    """Maps enrichment API response fields to CRM database columns."""
    fmt = enriched_lead.get("format_validation", {})
    email_v = enriched_lead.get("email_verification", {})
    phone_v = enriched_lead.get("phone_verification", {})
    phone_fmt = fmt.get("phone", {})
    addr_v = enriched_lead.get("address_verification", {})
    meta = enriched_lead.get("enrichment_metadata", {})

    return {
        # Email
        "email": enriched_lead.get("email", ""),
        "email_source": enriched_lead.get("email_source", ""),
        "email_verified": fmt.get("email", {}).get("valid", False),
        "email_deliverable": email_v.get("deliverable"),
        "email_is_catch_all": email_v.get("details", {}).get("is_catch_all", False),
        "email_is_disposable": fmt.get("email", {}).get("is_disposable", False),
        "email_is_role_based": fmt.get("email", {}).get("is_role_based", False),
        "email_confidence": email_v.get("confidence", 0),

        # Phone
        "phone": enriched_lead.get("phone", ""),
        "phone_normalized": phone_fmt.get("normalized", ""),
        "phone_display": phone_fmt.get("national_format", ""),
        "phone_source": enriched_lead.get("phone_source", ""),
        "phone_valid": phone_v.get("valid"),
        "phone_line_type": phone_v.get("line_type", ""),
        "phone_carrier": phone_v.get("carrier", ""),
        "phone_confidence": phone_v.get("confidence", 0),

        # Address
        "address": enriched_lead.get("location", ""),
        "address_standardized": addr_v.get("standardized", ""),
        "address_source": enriched_lead.get("address_source", ""),
        "address_valid": addr_v.get("valid"),
        "address_lat": (addr_v.get("coordinates") or {}).get("lat"),
        "address_lng": (addr_v.get("coordinates") or {}).get("lng"),
        "address_city": (addr_v.get("components") or {}).get("city", ""),
        "address_state": (addr_v.get("components") or {}).get("state", ""),
        "address_zip": (addr_v.get("components") or {}).get("zip", ""),
        "address_country": (addr_v.get("components") or {}).get("country", ""),
        "address_confidence": addr_v.get("confidence", 0),

        # Contact
        "contact_name": enriched_lead.get("contact_name", ""),
        "contact_title": enriched_lead.get("contact_title", ""),
        "contact_source": enriched_lead.get("contact_name_source", ""),

        # Extras
        "linkedin_url": enriched_lead.get("linkedin", ""),
        "company_size": enriched_lead.get("company_size", ""),

        # Metadata
        "enriched_at": meta.get("enriched_at"),
        "enrichment_providers": meta.get("providers_used", []),
        "enrichment_fields_filled": meta.get("fields_enriched", []),
        "enrichment_fields_missing": meta.get("fields_failed", []),
    }
```

---

## 6. TypeScript Types (for Next.js frontend)

```typescript
// ============================================================
// REQUEST TYPES
// ============================================================

interface LeadInput {
  company_name: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  contact_name?: string;
  contact_title?: string;
  extra?: Record<string, any>;
}

interface EnrichRequest {
  leads: LeadInput[];
  enrich_fields?: ("email" | "phone" | "address" | "contact_name" | "contact_title")[];
  verify_existing?: boolean;
  verify_deliverability?: boolean;
  enrichment_providers?: string[];
  skip_verified?: boolean;
  max_concurrent?: number;
}

// ============================================================
// RESPONSE TYPES
// ============================================================

interface EnrichResponse {
  status: "success";
  summary: {
    total_leads: number;
    enriched: number;
    skipped: number;
    verified: number;
    providers_strategy: string[];
  };
  leads: EnrichedLead[];
}

interface EnrichedLead {
  company_name: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  contact_name: string;
  contact_title: string;

  // Source tracking (only present for enriched fields)
  email_source?: string;
  phone_source?: string;
  address_source?: string;
  contact_name_source?: string;
  contact_title_source?: string;

  // Bonus fields
  linkedin?: string;
  company_size?: string;
  industry?: string;
  address?: string;

  // Validation & verification
  format_validation?: FormatValidation;
  email_verification?: EmailVerification;
  phone_verification?: PhoneVerification;
  address_verification?: AddressVerification;
  enrichment_metadata?: EnrichmentMetadata;

  // Pass-through from request
  extra?: Record<string, any>;
}

interface FormatValidation {
  email?: {
    valid: boolean;
    email: string;
    reason: string;
    warnings: string[];
    is_disposable: boolean;
    is_role_based: boolean;
  };
  phone?: {
    valid: boolean;
    phone: string;
    normalized: string;
    national_format: string;
    country_code: string;
    reason: string;
    warnings: string[];
    is_fake: boolean;
  };
  address?: {
    valid: boolean;
    address: string;
    reason: string;
    warnings: string[];
    has_street: boolean;
    has_city_state: boolean;
    is_po_box: boolean;
  };
}

interface EmailVerification {
  email: string;
  status: "valid" | "invalid" | "catch-all" | "unknown";
  deliverable: boolean;
  source: "zerobounce" | "hunter" | "none";
  confidence: number;
  details: {
    smtp_check: boolean;
    mx_records: boolean;
    is_catch_all: boolean;
    is_disposable: boolean;
    is_role_based: boolean;
    did_you_mean: string | null;
    provider: string;
  };
}

interface PhoneVerification {
  phone: string;
  valid: boolean;
  source: "numverify" | "twilio" | "none";
  line_type: "mobile" | "landline" | "voip" | "unknown";
  carrier: string;
  location: string;
  country_code: string;
  confidence: number;
}

interface AddressVerification {
  address: string;
  standardized: string;
  valid: boolean;
  source: "google" | "smarty" | "none";
  coordinates: { lat: number; lng: number } | null;
  components: {
    street_number?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
  };
  confidence: number;
}

interface EnrichmentMetadata {
  enriched_at: string;
  fields_enriched: string[];
  fields_still_missing: string[];
  fields_failed: string[];
  providers_used: string[];
  total_api_calls: number;
  enrichment_duration_ms: number;
}

// ============================================================
// SEARCH RESPONSE (GET /leads/search with enrich=true)
// ============================================================

interface SearchResponse {
  status: "success";
  discovery_mode: "platform" | "data_provider" | "ai_only";
  ai_engine: "Claude" | "ChatGPT" | "Gemini" | "Groq";
  search_metadata: {
    industry: string;
    location: string;
    discovery_sources: string[];
    total_found: number;
    errors_encountered: number;
  };
  leads: SearchLead[];
}

interface SearchLead extends EnrichedLead {
  ai_engine: string;
  source: string;
  discovery_mode: string;
  confidence_score: number;
  validated_by_ai: boolean;
  snippet: string;
  score: number;
  reason: string;
  extracted_email: string | null;
  extracted_phone: string | null;
  semantic_validation: Record<string, any>;
}
```

---

## 7. Quick Reference — Common Scenarios

### "I have a company name and website, find me an email"
```json
POST /leads/enrich
{
  "leads": [{"company_name": "Acme Corp", "website": "acme.com"}],
  "enrich_fields": ["email"],
  "enrichment_providers": ["auto"]
}
```

### "Verify emails for 50 leads from my database"
```json
POST /leads/enrich
{
  "leads": [
    {"company_name": "Acme Corp", "email": "john@acme.com"},
    {"company_name": "Beta Inc", "email": "info@beta.io"}
  ],
  "enrich_fields": [],
  "verify_existing": true,
  "verify_deliverability": true,
  "enrichment_providers": ["auto"]
}
```

### "Find dentists in NYC with full contact info"
```
GET /leads/search?industry=Dentists&location=New York, NY&ai_engine=Gemini&enrich=true&verify=true&exclude_empty_contacts=true&min_score=7
```

### "Enrich for free — no paid APIs"
```json
POST /leads/enrich
{
  "leads": [{"company_name": "Acme Corp", "website": "acme.com"}],
  "enrichment_providers": ["scrape_only"],
  "verify_deliverability": false
}
```

### "Only find phone numbers for these leads"
```json
POST /leads/enrich
{
  "leads": [
    {"company_name": "Acme Corp", "website": "acme.com"},
    {"company_name": "Beta Inc", "website": "beta.io"}
  ],
  "enrich_fields": ["phone"],
  "enrichment_providers": ["auto"]
}
```

### "Check if existing addresses are real and get coordinates"
```json
POST /leads/enrich
{
  "leads": [
    {"company_name": "Acme Corp", "location": "123 Main St, New York, NY 10001"}
  ],
  "enrich_fields": [],
  "verify_existing": true,
  "verify_deliverability": true
}
```

---

## 8. Rate Limits & Timeouts

| Consideration | Recommendation |
|---------------|----------------|
| **Timeout per lead** | ~5-15 seconds for enrichment (depends on tiers used) |
| **Batch timeout** | Set HTTP client timeout to `60s` for up to 10 leads, `120s` for up to 50 leads |
| **Max batch size** | 50 leads per request (enforced by API) |
| **Concurrency** | Default `max_concurrent=5`. Lower to 2-3 if hitting rate limits. |
| **Budget** | Default max $5.00 per batch. Configurable via `ENRICHMENT_MAX_COST_PER_BATCH` in `.env`. |
| **Free scraping** | Website scraping has 2-second delay between pages (polite crawling). Max 5 pages per domain. |
| **Retry strategy** | If a 429 (rate limit) is returned by the enrichment API's upstream providers, it gracefully skips that provider and continues with the next tier. No need to retry from CRM side. |
