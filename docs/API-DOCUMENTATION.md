# API Documentation

## Local Base URL

`http://127.0.0.1:8000`

Interactive documentation: `http://127.0.0.1:8000/docs`

Protected endpoints expect a Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

## Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/` | No | API root metadata |
| GET | `/api/health` | No | Health check |
| POST | `/api/plans/generate` | Yes | Generate a general-wellness plan |
| GET | `/api/plans` | Yes | List current user's saved plans |
| GET | `/api/plans/{plan_id}` | Yes | Retrieve one saved plan |
| DELETE | `/api/plans/{plan_id}` | Yes | Delete one saved plan |
| GET | `/api/profile` | Yes | Get current user profile |
| PUT | `/api/profile` | Yes | Update current user profile |
| POST | `/api/upload` | Yes | Store file metadata |
| GET | `/api/files` | Yes | List current user's file metadata |
| DELETE | `/api/files/{file_id}` | Yes | Delete file metadata |

## Common Status Codes

- `200` — successful read/update/delete operation
- `201` — resource created where applicable
- `400` — invalid input
- `401` — missing or invalid authentication
- `404` — requested resource not found or not owned by the user
- `422` — FastAPI/Pydantic validation failure
- `500` — unexpected server error
- `503` — cloud database/service unavailable

## Security Rule

Never accept a client-provided UID as the source of truth for authorization. Use the UID obtained from the verified Firebase ID token.
