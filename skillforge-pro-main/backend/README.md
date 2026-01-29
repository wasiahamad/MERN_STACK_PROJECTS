# SkillForge Backend (Express + MongoDB)

Backend-first implementation for:
- JWT auth (role-based)
- Email OTP verification for signup (account not usable until verified)
- OTP-based password reset
- Recruiter profile (must be complete before posting jobs)

## Quick start

1) Create env
- Copy `.env.example` to `.env` and fill values.

2) Install deps
- `npm install`

3) Run
- `npm run dev`

Server defaults to `http://localhost:5000`.

## API response format

Success:
```json
{ "data": {}, "message": "..." }
```

Error:
```json
{ "error": { "code": "...", "message": "..." } }
```

## Testing

Run tests:
- `npm test`   (run all tests)