# QuoteCraft Backend - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- A code editor (VS Code recommended)

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

This installs all required packages including TypeScript, Express, and watsonx integration libraries.

## Step 2: Configure Environment (30 seconds)

```bash
cp .env.example .env
```

The default `.env` works out of the box with mock implementations. For production, add your IBM watsonx credentials:

```env
IBM_ORCHESTRATE_API_KEY=your_api_key_here
IBM_ORCHESTRATE_AGENT_ID=your_agent_id_here
```

## Step 3: Start the Server (30 seconds)

```bash
npm run dev
```

You should see:
```
🚀 QuoteCraft Backend running on port 3001
📍 Environment: development
🔗 API Base URL: http://localhost:3001/api
```

## Step 4: Test the API (2 minutes)

### Option A: Using curl

**1. Health Check**
```bash
curl http://localhost:3001/health
```

**2. Upload BOQ**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-data/sample-boq.json" \
  -F "fileType=boq"
```

**3. Create Comparison**
```bash
curl -X POST http://localhost:3001/api/comparison \
  -H "Content-Type: application/json" \
  -d @sample-data/comparison-request.json
```

**4. Get KPIs**
```bash
curl http://localhost:3001/api/kpi
```

### Option B: Using REST Client (VS Code)

1. Install "REST Client" extension in VS Code
2. Open `test-api.http`
3. Click "Send Request" above any endpoint

### Option C: Using Postman

1. Import the API endpoints from `API_DOCUMENTATION.md`
2. Set base URL to `http://localhost:3001`
3. Test each endpoint

## Step 5: Explore the Code (1 minute)

Key files to check out:

```
src/
├── server.ts                    # Main entry point
├── controllers/
│   └── comparison.controller.ts # Comparison logic
├── services/
│   ├── vendor-matcher.service.ts    # Matching algorithm
│   └── policy-engine.service.ts     # Business rules
└── models/
    └── types.ts                 # TypeScript types
```

## Common Tasks

### Build for Production
```bash
npm run build
npm start
```

### Watch Mode (Auto-rebuild)
```bash
npm run watch
```

### View Logs
```bash
# Real-time logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log
```

### Test All Endpoints
Open `test-api.http` in VS Code with REST Client extension and run all requests.

## Sample Workflow

Here's a complete workflow to test the system:

### 1. Upload BOQ
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-data/sample-boq.json" \
  -F "fileType=boq"
```

Save the `fileId` from the response.

### 2. Upload 3 Vendor Quotes
```bash
# Vendor 1
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-data/sample-quote-vendor1.json" \
  -F "fileType=quote" \
  -F "vendorName=Best Supply Co." \
  -F "vendorId=vendor-123"

# Vendor 2
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-data/sample-quote-vendor2.json" \
  -F "fileType=quote" \
  -F "vendorName=Quality Goods Inc." \
  -F "vendorId=vendor-456"

# Vendor 3
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample-data/sample-quote-vendor3.json" \
  -F "fileType=quote" \
  -F "vendorName=Trusted Partners Ltd." \
  -F "vendorId=vendor-789"
```

### 3. Create Comparison
Use the sample data in `test-api.http` or create a JSON file with BOQ + quotes and POST to `/api/comparison`.

### 4. Get Comparison Results
```bash
curl http://localhost:3001/api/comparison/{comparisonId}
```

Replace `{comparisonId}` with the ID from step 3.

### 5. Approve/Reject
```bash
curl -X POST http://localhost:3001/api/approval \
  -H "Content-Type: application/json" \
  -d '{
    "comparisonId": "comp-xyz789",
    "decision": "APPROVED",
    "approverRole": "PROCUREMENT_MANAGER",
    "approverEmail": "manager@company.com",
    "comment": "Approved"
  }'
```

### 6. View KPIs
```bash
curl http://localhost:3001/api/kpi
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3002
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild
npm run build
```

### Can't Connect to watsonx
The system works with mock implementations by default. To use real watsonx:
1. Get API key from IBM Cloud
2. Add to `.env`
3. Restart server

## Next Steps

1. **Read the Documentation**
   - [README.md](README.md) - Overview
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API details
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

2. **Customize**
   - Modify policy rules in `src/services/policy-engine.service.ts`
   - Add new endpoints in `src/routes/`
   - Extend services in `src/services/`

3. **Deploy**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for IBM Cloud, Docker, or Kubernetes

4. **Integrate**
   - Connect to real ERP system
   - Add authentication
   - Set up Slack notifications

## Support

- Check logs in `logs/` directory
- Review error messages in console
- Consult [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Open an issue on GitHub

## Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200 OK
- [ ] File upload works
- [ ] Comparison creates successfully
- [ ] Approval creates PO
- [ ] KPIs return data
- [ ] Logs are being written

If all checks pass, you're ready to go! 🚀

---

**Happy Hacking!** 🎉
