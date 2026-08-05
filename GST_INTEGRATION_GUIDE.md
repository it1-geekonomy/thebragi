# GSTIN Validation — Website Only

## Data sources

| Field | Source |
|-------|--------|
| Legal name, PAN | GST validation API (`GST_VALIDATION_API_URL`) |
| Billing address | User types manually |
| Pincode, state, country | Parsed from billing address (6-digit pin → India Post lookup) |

## Flow

```
GSTIN entered → GET /api/gst/validate → legal name + PAN (read-only)
User types billing address (include pincode)
  → pincode extracted from text
  → GET /api/postal-lookup?code=560078 → state + country
  → CGST+SGST vs IGST recalculated from place of supply
Pay → re-validate GSTIN → success → app
```

## Env (`.env.local`)

```env
GST_VALIDATION_API_URL=https://your-gst-vendor.example.com/v1
GST_VALIDATION_API_KEY=your_api_key
GST_VALIDATION_API_PATH=/gst/validate
```

## GST API response (minimum)

```json
{
  "valid": true,
  "legalName": "Geekonomy Technology Private Limited",
  "pan": "AAJCG1234M"
}
```

Address is **not** required from the GST API.

## Billing address

User enters full address with a **6-digit Indian pincode**. The site extracts the pincode and calls India Post to resolve state (place of supply) and country for tax.
