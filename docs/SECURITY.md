# Security Notes

## Authentication

Firebase Authentication manages user identity. The React client obtains an ID token after login.

## Authorization

FastAPI verifies the Firebase ID token and uses the verified UID to access user-specific records.

Firestore rules also enforce document ownership using `request.auth.uid`.

## Secrets

Never commit:

- `.env`
- Firebase Admin service-account JSON
- AI provider API keys
- Database credentials
- JWT signing secrets, if introduced later

The current project keeps the service-account file under `backend/secrets/`, which is ignored by Git.

## File Upload Security

The current MVP validates file extension and file size before storing content locally.

For production object storage, add:

- MIME/content verification
- malware scanning
- randomized object names
- private bucket/object permissions
- signed download URLs where appropriate
- retention/deletion rules

## API Security

Use explicit CORS origins, validate request payloads, reject unauthorized requests, avoid logging credentials, and add rate limiting before exposing endpoints publicly.
