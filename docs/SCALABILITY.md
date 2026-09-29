# Scalability Notes

## 10 Users

A single backend instance and managed Firebase services are enough for a classroom demonstration.

## 1,000 Users

Move the backend to managed hosting, enable monitoring, use production object storage, and consider caching frequently read data.

## 100,000 Users

Use:

- load balancers
- autoscaling backend instances
- serverless/background workers for asynchronous work
- managed database services
- object storage
- CDN
- caching
- message queues
- structured monitoring/logging

## Example: High File-Upload Burst

When many users upload files near a deadline, the request path should avoid doing expensive processing inside the initial web request.

```text
Client
  ↓
API Gateway / Load Balancer
  ↓
FastAPI upload service
  ↓
Object Storage
  ↓
Queue
  ↓
Background Worker
  ├── validation
  ├── malware scan
  └── metadata update
  ↓
Firestore / Database
```

This separates interactive traffic from heavy background work and lets each layer scale independently.
