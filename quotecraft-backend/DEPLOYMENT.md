# QuoteCraft Backend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- IBM Cloud account (for watsonx Orchestrate)
- Git (for version control)

## Local Development

### 1. Clone and Setup

```bash
git clone <repository-url>
cd quotecraft-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3001
NODE_ENV=development
IBM_ORCHESTRATE_API_KEY=your_api_key_here
IBM_ORCHESTRATE_AGENT_ID=your_agent_id_here
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 3. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

Compiled files will be in the `dist/` directory.

---

## IBM Cloud Deployment

### Option 1: IBM Cloud Foundry

1. **Install IBM Cloud CLI**
```bash
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
```

2. **Login to IBM Cloud**
```bash
ibmcloud login
ibmcloud target --cf
```

3. **Create manifest.yml**
```yaml
applications:
- name: quotecraft-backend
  memory: 512M
  instances: 1
  buildpack: nodejs_buildpack
  command: npm start
  env:
    NODE_ENV: production
```

4. **Deploy**
```bash
npm run build
ibmcloud cf push
```

### Option 2: IBM Code Engine

1. **Create Code Engine Project**
```bash
ibmcloud ce project create --name quotecraft
ibmcloud ce project select --name quotecraft
```

2. **Build and Deploy**
```bash
ibmcloud ce application create \
  --name quotecraft-backend \
  --build-source . \
  --strategy dockerfile \
  --port 3001 \
  --env NODE_ENV=production \
  --env IBM_ORCHESTRATE_API_KEY=<your-key> \
  --env IBM_ORCHESTRATE_AGENT_ID=<your-id>
```

3. **Get Application URL**
```bash
ibmcloud ce application get --name quotecraft-backend
```

---

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY logs ./logs

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### 2. Build Docker Image

```bash
npm run build
docker build -t quotecraft-backend:latest .
```

### 3. Run Container

```bash
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e IBM_ORCHESTRATE_API_KEY=<your-key> \
  -e IBM_ORCHESTRATE_AGENT_ID=<your-id> \
  --name quotecraft-backend \
  quotecraft-backend:latest
```

### 4. Docker Compose (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - IBM_ORCHESTRATE_API_KEY=${IBM_ORCHESTRATE_API_KEY}
      - IBM_ORCHESTRATE_AGENT_ID=${IBM_ORCHESTRATE_AGENT_ID}
    volumes:
      - ./logs:/app/logs
```

Run:
```bash
docker-compose up -d
```

---

## Kubernetes Deployment

### 1. Create Deployment YAML

`k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quotecraft-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: quotecraft-backend
  template:
    metadata:
      labels:
        app: quotecraft-backend
    spec:
      containers:
      - name: backend
        image: quotecraft-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: IBM_ORCHESTRATE_API_KEY
          valueFrom:
            secretKeyRef:
              name: quotecraft-secrets
              key: api-key
```

### 2. Create Service

`k8s/service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: quotecraft-backend
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3001
  selector:
    app: quotecraft-backend
```

### 3. Deploy

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## Environment Variables

### Required
- `IBM_ORCHESTRATE_API_KEY` - watsonx Orchestrate API key
- `IBM_ORCHESTRATE_AGENT_ID` - Agent ID

### Optional
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - CORS origin
- `SLACK_WEBHOOK_URL` - Slack notifications
- `MOCK_ERP_ENABLED` - Use mock ERP (default: true)
- `LOG_LEVEL` - Logging level (default: info)

---

## Health Checks

Configure health checks for your deployment:

**Endpoint:** `GET /health`

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "environment": "production",
  "uptime": 123.456
}
```

---

## Monitoring

### Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Metrics to Monitor

- Response time
- Error rate
- Memory usage
- CPU usage
- Request count

### Recommended Tools

- IBM Cloud Monitoring
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog

---

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/TLS
- [ ] Implement rate limiting
- [ ] Add authentication (JWT/API keys)
- [ ] Enable CORS with specific origins
- [ ] Keep dependencies updated
- [ ] Use security headers (helmet.js)
- [ ] Implement input validation
- [ ] Enable audit logging

---

## Scaling

### Horizontal Scaling

Increase the number of instances:

**Cloud Foundry:**
```bash
ibmcloud cf scale quotecraft-backend -i 3
```

**Code Engine:**
```bash
ibmcloud ce application update quotecraft-backend --min-scale 2 --max-scale 10
```

**Kubernetes:**
```bash
kubectl scale deployment quotecraft-backend --replicas=5
```

### Vertical Scaling

Increase memory/CPU:

**Cloud Foundry:**
```bash
ibmcloud cf scale quotecraft-backend -m 1G
```

**Code Engine:**
```bash
ibmcloud ce application update quotecraft-backend --memory 1G --cpu 1
```

---

## Troubleshooting

### Server Won't Start

1. Check logs: `cat logs/error.log`
2. Verify environment variables
3. Ensure port 3001 is available
4. Check Node.js version (18+)

### watsonx Orchestrate Connection Issues

1. Verify API key and agent ID
2. Check network connectivity
3. Review watsonx Orchestrate status
4. Check API endpoint URL

### High Memory Usage

1. Monitor with `npm run watch`
2. Check for memory leaks
3. Increase container memory
4. Optimize data structures

---

## Rollback

### Cloud Foundry
```bash
ibmcloud cf rollback quotecraft-backend
```

### Code Engine
```bash
ibmcloud ce application update quotecraft-backend --image <previous-image>
```

### Kubernetes
```bash
kubectl rollout undo deployment/quotecraft-backend
```

---

## CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to IBM Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to IBM Cloud
        run: |
          ibmcloud login --apikey ${{ secrets.IBM_CLOUD_API_KEY }}
          ibmcloud target --cf
          ibmcloud cf push
```

---

## Support

For deployment issues:
1. Check logs
2. Review documentation
3. Contact IBM Cloud support
4. Open GitHub issue

---

## License

MIT
