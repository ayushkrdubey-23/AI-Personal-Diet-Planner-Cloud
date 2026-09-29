# Cloud Deployment Roadmap

## Current Local Architecture

```text
Browser
  ├── React/Vite frontend :5173
  └── FastAPI backend :8000
          ├── Firebase Admin token verification
          └── Firestore
```

## Approach A — Student-Friendly Cloud Architecture

### Frontend
Deploy the Vite production build to a static hosting provider.

Build command:

```bash
npm run build
```

The generated `dist/` directory can be deployed to a static host/CDN.

### Backend
Deploy the FastAPI application to a managed Python web service or container platform.

Runtime command:

```bash
python -m uvicorn backend.app:app --host 0.0.0.0 --port $PORT
```

Configure environment variables/secrets using the host's secret manager rather than committing credentials.

### Firebase
Keep:

- Firebase Authentication for identity
- Firestore for application records

### File Storage
For production, replace the current local browser-storage simulation with a managed object-storage service.

## Approach B — AWS-Style Architecture

| Current concept | AWS example |
|---|---|
| React static frontend | S3 + CloudFront |
| FastAPI backend | App Runner / ECS / Lambda |
| API routing | API Gateway |
| Database | DynamoDB or PostgreSQL |
| Object storage | S3 |
| Authentication | Cognito or Firebase Auth |
| Monitoring | CloudWatch |

## Production Changes Before Deployment

1. Use HTTPS everywhere.
2. Replace development CORS origins with exact production domains.
3. Store service credentials in a managed secrets system.
4. Move file bytes to object storage.
5. Add rate limiting and request logging.
6. Add health checks and monitoring.
7. Add automated build/test deployment through CI/CD.
8. Test Firestore security rules with separate users.
