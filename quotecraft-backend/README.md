# QuoteCraft Backend

**Automated BOQ & Vendor Quote Comparison Agent for Procurement**

Built for IBM watsonx Orchestrate Agentic AI Hackathon (November 21-23, 2025)

## Overview

QuoteCraft Backend is an intelligent procurement automation system that leverages IBM watsonx Orchestrate to streamline Bill of Quantities (BOQ) and vendor quote processing. The system automates document extraction, vendor comparison, policy-based routing, and ERP integration, reducing manual procurement processing time by up to 80%.

This TypeScript-based REST API serves as the core engine for the QuoteCraft platform, handling document parsing, vendor analysis, policy enforcement, and integration with external systems including IBM watsonx Orchestrate, ERP systems, and notification services.

## Features

- **Document Parsing**: Automated extraction of BOQ and vendor quotes
- **Vendor Comparison**: Intelligent matching and scoring of vendor quotes
- **Policy Engine**: Automated compliance checking and approval routing
- **watsonx Orchestrate Integration**: Deterministic flows for reliable execution
- **ERP Integration**: Automated purchase order creation
- **Notifications**: Slack and email alerts for approvals
- **KPI Dashboard**: Real-time metrics and analytics

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **IBM watsonx Orchestrate**: AI agent orchestration
- **Dependencies**: axios, winston, multer, joi, uuid

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- IBM watsonx Orchestrate credentials
- Slack webhook URL (optional)
- ERP settings

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Upload BOQ/Quote
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (JSON, PDF, or Excel)
- fileType: "boq" | "quote"
- vendorName: string (for quotes)
- vendorId: string (for quotes)
```

### Create Comparison
```
POST /api/comparison
Content-Type: application/json

Body:
{
  "boqData": { BOQ object },
  "quotes": [ Quote objects ]
}
```

### Get Comparison
```
GET /api/comparison/:id
```

### Submit Approval
```
POST /api/approval
Content-Type: application/json

Body:
{
  "comparisonId": "string",
  "decision": "APPROVED" | "REJECTED",
  "approverRole": "string",
  "approverEmail": "string",
  "comment": "string"
}
```

### Get KPIs
```
GET /api/kpi
```

## Project Structure

```
quotecraft-backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # TypeScript types
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utilities (logger, helpers)
│   └── server.ts          # Main entry point
├── logs/                  # Application logs
├── .env.example           # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Services

### Document Parser Service
Extracts structured data from BOQ and quote documents. Supports JSON format with fallback to mock data for demo purposes.

### Vendor Matcher Service
Matches BOQ items with vendor quote items using SKU matching. Calculates price variance and flags outliers.

### Policy Engine Service
Evaluates business rules:
- Three-quote rule for purchases > $10k
- Spec compliance checking
- Cost variance warnings
- Approval routing based on thresholds

### watsonx Orchestrate Service
Triggers IBM watsonx Orchestrate flows:
- Document extraction flow
- Vendor comparison flow
- Approval routing flow

### ERP Integration Service
Creates purchase orders in ERP systems. Includes mock implementation for testing.

### Notification Service
Sends Slack and email notifications for approval requests.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | CORS origin | http://localhost:3000 |
| IBM_ORCHESTRATE_URL | watsonx API URL | - |
| IBM_ORCHESTRATE_API_KEY | watsonx API key | - |
| IBM_ORCHESTRATE_AGENT_ID | Agent ID | - |
| SLACK_WEBHOOK_URL | Slack webhook | - |
| MOCK_ERP_ENABLED | Use mock ERP | true |
| LOG_LEVEL | Logging level | info |

## Sample Data

Sample BOQ and quote files are available in JSON format. Upload via the `/api/upload` endpoint to test the system.

## Development

### Type Checking
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

## Testing

Test the API using curl or Postman:

```bash
# Health check
curl http://localhost:3001/health

# Upload BOQ
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-boq.json" \
  -F "fileType=boq"

# Get KPIs
curl http://localhost:3001/api/kpi
```

## Deployment

### IBM Cloud
1. Build the project: `npm run build`
2. Deploy to IBM Cloud Foundry or Code Engine
3. Set environment variables in IBM Cloud console

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

## Architecture

QuoteCraft uses a layered architecture:

1. **Routes**: Handle HTTP requests
2. **Controllers**: Coordinate business logic
3. **Services**: Implement core functionality
4. **Models**: Define data structures

The system integrates with IBM watsonx Orchestrate for AI-powered workflow orchestration, ensuring deterministic execution of complex procurement processes.

## License

MIT

## Team

QuoteCraft Team - IBM watsonx Orchestrate Hackathon 2025

## Support

For issues or questions, please open an issue in the repository.
