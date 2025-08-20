# Deployment Guide

This guide covers various deployment options for the PDF Complete application.

## Frontend Deployment

The frontend is a static React application that can be deployed to any static hosting service.

### Building for Production

```bash
cd webapp
npm install
npm run build
```

This creates a `dist/` directory with optimized static files.

### Environment Configuration

Set the API base URL for production:

```bash
# .env.production
VITE_API_BASE=https://your-api-domain.com/api
```

Or set during build:
```bash
VITE_API_BASE=https://your-api-domain.com/api npm run build
```

### Static Hosting Options

#### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `cd webapp && npm run build`
3. Set publish directory: `webapp/dist`
4. Add environment variables in Netlify dashboard

#### Vercel

1. Import project from GitHub
2. Set root directory: `webapp`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

#### GitHub Pages

```bash
# Add to package.json
"homepage": "https://username.github.io/pdfComplete"

# Build and deploy
npm run build
npx gh-pages -d dist
```

#### AWS S3 + CloudFront

1. Create S3 bucket for static hosting
2. Upload `dist/` contents to bucket
3. Configure CloudFront distribution
4. Set custom domain (optional)

#### Firebase Hosting

```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

### Docker Deployment

Create a `Dockerfile` in the webapp directory:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

And `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api/ {
            proxy_pass http://backend:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

Build and run:
```bash
docker build -t pdf-complete-frontend .
docker run -p 80:80 pdf-complete-frontend
```

## Backend Deployment

*Note: This section provides general guidance as the backend implementation is not included in this repository.*

### Requirements

The backend should provide the following API endpoints:
- `GET /api/pdfs` - List available PDFs
- `GET /api/fields_schema` - Get schema metadata
- `POST /api/combined_fields` - Analyze combined fields
- `POST /api/fill` - Fill PDF forms
- `POST /api/admin/regenerate` - Admin schema regeneration

### Technology Options

#### Python (FastAPI/Flask)

```python
# Example FastAPI structure
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/pdfs")
async def list_pdfs():
    # Implementation here
    pass
```

#### Node.js (Express)

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/pdfs', (req, res) => {
    // Implementation here
});

app.listen(8000);
```

### Docker Backend Example

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Full Stack Deployment

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: ./webapp
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE=http://localhost:8000/api

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./pdfs:/app/pdfs
    environment:
      - DATABASE_URL=sqlite:///app.db
      - ADMIN_KEY=your-admin-key

  # Optional: Add database service
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=pdfcomplete
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose up -d
```

### Kubernetes

Example Kubernetes manifests:

**Frontend Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-complete-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pdf-complete-frontend
  template:
    metadata:
      labels:
        app: pdf-complete-frontend
    spec:
      containers:
      - name: frontend
        image: pdf-complete-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: pdf-complete-frontend-service
spec:
  selector:
    app: pdf-complete-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

**Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pdf-complete-ingress
spec:
  rules:
  - host: pdfcomplete.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pdf-complete-frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: pdf-complete-backend-service
            port:
              number: 8000
```

### Cloud Platform Deployments

#### AWS

**Frontend (S3 + CloudFront):**
- Upload build files to S3
- Configure CloudFront distribution
- Set up Route 53 for custom domain

**Backend (ECS/Lambda):**
- Deploy to AWS ECS or Lambda
- Use API Gateway for routing
- Store PDFs in S3

#### Google Cloud

**Frontend (Firebase Hosting):**
```bash
firebase init hosting
firebase deploy
```

**Backend (Cloud Run):**
```bash
gcloud run deploy pdf-complete-backend \
  --image gcr.io/PROJECT/pdf-complete-backend \
  --platform managed \
  --region us-central1
```

#### Azure

**Frontend (Static Web Apps):**
- Deploy through GitHub Actions
- Automatic build and deployment

**Backend (Container Instances):**
- Deploy container to Azure Container Instances
- Use Azure Storage for PDF files

## Environment Variables

### Frontend

- `VITE_API_BASE`: Backend API URL

### Backend (Example)

- `DATABASE_URL`: Database connection string
- `ADMIN_KEY`: Administrative access key
- `PDF_STORAGE_PATH`: Path to PDF files
- `CORS_ORIGINS`: Allowed CORS origins

## Monitoring and Logging

### Frontend

- Use analytics tools (Google Analytics, Plausible)
- Monitor JavaScript errors (Sentry)
- Track performance metrics

### Backend

- Monitor API response times
- Log errors and exceptions
- Track resource usage
- Set up health checks

## Security Considerations

### Frontend

- Serve over HTTPS
- Configure CSP headers
- Validate all user inputs
- Keep dependencies updated

### Backend

- Implement rate limiting
- Validate file uploads
- Secure API endpoints
- Use environment variables for secrets
- Regular security updates

### Infrastructure

- Use reverse proxy (nginx/Cloudflare)
- Configure firewall rules
- Regular backups
- SSL/TLS certificates

## Performance Optimization

### Frontend

- Enable gzip compression
- Use CDN for static assets
- Implement caching headers
- Optimize images and assets

### Backend

- Implement response caching
- Database query optimization
- Use connection pooling
- Load balancing for multiple instances

## Backup and Recovery

- Regular database backups
- PDF file backups
- Configuration backups
- Disaster recovery plan

## Scaling

### Frontend

- CDN distribution
- Multiple edge locations
- Caching strategies

### Backend

- Horizontal scaling
- Load balancers
- Database replication
- Microservices architecture

This deployment guide should be adapted based on your specific infrastructure requirements and chosen technology stack.