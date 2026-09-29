# Testing Checklist

Use two separate Firebase test accounts to validate user isolation.

| ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| T01 | Register new user | Account created | Fill after run | ☐ |
| T02 | Login with valid credentials | User enters dashboard | Fill after run | ☐ |
| T03 | Login with invalid credentials | Friendly authentication error | Fill after run | ☐ |
| T04 | Protected page while logged out | Redirect to public page/login | Fill after run | ☐ |
| T05 | Save profile | Profile persisted | Fill after run | ☐ |
| T06 | Retrieve profile | Current user's profile returned | Fill after run | ☐ |
| T07 | Generate plan | Plan generated successfully | Fill after run | ☐ |
| T08 | Save plan | Plan appears in Saved Plans | Fill after run | ☐ |
| T09 | Retrieve plans | Only current user's plans returned | Fill after run | ☐ |
| T10 | Delete plan | Selected plan removed | Fill after run | ☐ |
| T11 | Daily tracker | Daily data persists | Fill after run | ☐ |
| T12 | Dashboard analytics | Counts and progress displayed | Fill after run | ☐ |
| T13 | Upload valid JPG/PNG/PDF/TXT | File accepted under 2 MB | Fill after run | ☐ |
| T14 | Upload invalid extension | File rejected | Fill after run | ☐ |
| T15 | Upload file above 2 MB | File rejected | Fill after run | ☐ |
| T16 | File metadata retrieval | Current user's metadata listed | Fill after run | ☐ |
| T17 | Delete file | Local file + metadata removed | Fill after run | ☐ |
| T18 | Missing/invalid API token | 401 response | Fill after run | ☐ |
| T19 | User A accesses User B resource | Access denied / resource hidden | Fill after run | ☐ |
| T20 | Backend smoke tests | `pytest -q` passes | Fill after run | ☐ |

## Commands

```bash
python -m compileall backend
pytest -q
```

## Evidence to Capture

- Successful backend startup
- Swagger endpoint list
- `/api/health` response
- Successful registration/login
- Saved plan in Firestore
- Tracker record in Firestore
- File metadata in Firestore
- Automated test result
