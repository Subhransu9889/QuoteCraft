# QuoteCraft Backend API Documentation

## Base URL
```
http://localhost:3001
```

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "environment": "development",
  "uptime": 123.456
}
```

---

### 2. Upload File

Upload a BOQ or vendor quote document.

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (required): The document file (JSON, PDF, or Excel)
- `fileType` (required): Either "boq" or "quote"
- `vendorName` (optional): Vendor name (required for quotes)
- `vendorId` (optional): Vendor ID (required for quotes)

**Example Request (curl):**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-boq.json" \
  -F "fileType=boq"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "fileId": "boq-abc123",
    "fileName": "sample-boq.json",
    "fileType": "boq",
    "parsedData": {
      "id": "boq-001",
      "version": "1.0",
      "items": [...],
      "totalBOQ": 47250.00
    },
    "flowExecutionId": "exec-1234567890",
    "status": "STARTED"
  },
  "message": "File uploaded and parsed successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "No file provided"
  }
}
```

---

### 3. Create Comparison

Compare multiple vendor quotes against a BOQ.

**Endpoint:** `POST /api/comparison`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "boqData": {
    "id": "boq-001",
    "version": "1.0",
    "dateCreated": "2025-11-21T10:00:00Z",
    "currency": "USD",
    "items": [
      {
        "lineNo": 1,
        "sku": "WIDGET-100",
        "description": "Premium Widget",
        "spec": "Aluminum, 10cm, Grade A",
        "qty": 500,
        "uom": "UNIT",
        "estimatedPrice": 45.00,
        "totalEstimate": 22500.00
      }
    ],
    "totalBOQ": 47250.00
  },
  "quotes": [
    {
      "id": "quote-001",
      "vendorId": "vendor-123",
      "vendorName": "Best Supply Co.",
      "dateReceived": "2025-11-21T09:30:00Z",
      "currency": "USD",
      "items": [
        {
          "boqLineNo": 1,
          "sku": "WIDGET-100",
          "unitPrice": 42.50,
          "qty": 500,
          "minQty": 100,
          "leadTime": 14,
          "tax": 0.08,
          "lineTotal": 22950.00
        }
      ],
      "shippingCost": 500.00,
      "discountPercent": 5,
      "totalCost": 46090.00,
      "paymentTerms": "Net 30",
      "warranty": "12 months"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "comp-xyz789",
    "boqId": "boq-001",
    "quotes": [
      {
        "vendorId": "vendor-123",
        "vendorName": "Best Supply Co.",
        "totalCost": 46090.00,
        "variance": -2.45,
        "complianceScore": 100,
        "deliveryDays": 14,
        "score": 101.23,
        "recommendation": "RECOMMENDED"
      }
    ],
    "bestVendor": "Best Supply Co.",
    "costSavings": 1160.00,
    "approvalRoute": "PROCUREMENT_MANAGER",
    "status": "PENDING_APPROVAL",
    "createdAt": "2025-11-21T10:30:00.000Z",
    "policyEvaluation": {
      "violations": [],
      "warnings": [],
      "policyChecksPassed": true
    }
  },
  "message": "Comparison created successfully"
}
```

---

### 4. Get Comparison

Retrieve a specific comparison by ID.

**Endpoint:** `GET /api/comparison/:id`

**URL Parameters:**
- `id` (required): Comparison ID

**Example Request:**
```bash
curl http://localhost:3001/api/comparison/comp-xyz789
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "comp-xyz789",
    "boqId": "boq-001",
    "quotes": [...],
    "bestVendor": "Best Supply Co.",
    "costSavings": 1160.00,
    "approvalRoute": "PROCUREMENT_MANAGER",
    "status": "PENDING_APPROVAL",
    "createdAt": "2025-11-21T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "message": "Comparison not found"
  }
}
```

---

### 5. Submit Approval

Approve or reject a comparison.

**Endpoint:** `POST /api/approval`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "comparisonId": "comp-xyz789",
  "decision": "APPROVED",
  "approverRole": "PROCUREMENT_MANAGER",
  "approverEmail": "manager@company.com",
  "comment": "Approved - Best value for money"
}
```

**Fields:**
- `comparisonId` (required): ID of the comparison
- `decision` (required): Either "APPROVED" or "REJECTED"
- `approverRole` (required): Role of the approver
- `approverEmail` (required): Email of the approver
- `comment` (optional): Approval comment

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "approval-abc123",
    "comparisonId": "comp-xyz789",
    "decision": "APPROVED",
    "timestamp": "2025-11-21T11:00:00.000Z",
    "nextStep": "PO Created: PO-TEST-1732185600000",
    "approvalId": "approval-abc123",
    "message": "Approval successful, PO created",
    "poDetails": {
      "success": true,
      "poNumber": "PO-TEST-1732185600000",
      "poId": "po-def456",
      "status": "CREATED",
      "createdAt": "2025-11-21T11:00:00.000Z",
      "vendorNotificationSent": true
    }
  },
  "message": "Approval approved successfully"
}
```

---

### 6. Get KPIs

Retrieve key performance indicators.

**Endpoint:** `GET /api/kpi`

**Example Request:**
```bash
curl http://localhost:3001/api/kpi
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProcessed": 42,
    "avgProcessingTime": "3.5 minutes",
    "stpRate": 78.5,
    "autoApprovedCount": 33,
    "escalatedCount": 9,
    "totalCostSavings": 125000.00,
    "avgCostVariance": -4.2,
    "errorRate": 2.1
  },
  "message": "KPIs retrieved successfully"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2025-11-21T10:00:00.000Z"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Models

### BOQ (Bill of Quantities)
```typescript
{
  id: string;
  version: string;
  dateCreated: string;
  currency: string;
  items: BOQItem[];
  totalBOQ: number;
}
```

### Quote
```typescript
{
  id: string;
  vendorId: string;
  vendorName: string;
  dateReceived: string;
  currency: string;
  items: QuoteItem[];
  shippingCost: number;
  discountPercent: number;
  totalCost: number;
  paymentTerms: string;
  warranty: string;
}
```

### Vendor Score
```typescript
{
  vendorId: string;
  vendorName: string;
  totalCost: number;
  variance: number;
  complianceScore: number;
  deliveryDays: number;
  score: number;
  recommendation: 'RECOMMENDED' | 'ACCEPTABLE' | 'FLAG_REVIEW';
}
```

---

## Testing

Use the provided `test-api.http` file with REST Client extension in VS Code, or use curl/Postman with the examples above.

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## Authentication

Currently no authentication is required. For production, implement JWT or API key authentication.
