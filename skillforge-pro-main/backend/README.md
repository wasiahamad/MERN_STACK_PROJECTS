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

## Skill Verification & Assessment

### Endpoints (auth required: candidate + verified email)

- `POST /api/assessments/generate`
	- Body: `{ "skillName": "React" }`
	- Returns: `{ attempt, questions[] }`
	- Notes: questions do not include the correct answer.

- `POST /api/assessments/:attemptId/submit`
	- Body:
		- `answers`: array of 10 `{ questionId, selectedIndex }`
		- `violationCount`: number
		- `autoSubmitted`: boolean
	- Returns: `{ result: { accuracy, status, attemptCount, ... } }`

- `GET /api/assessments/history?skillName=React`

### AI configuration

These are optional environment variables:

- `OPENAI_API_KEY` (required to generate questions for any skill)
- `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`)

If `OPENAI_API_KEY` is not set, generation only works for skills with a small built-in fallback bank.

## Testing

Run tests:
- `npm test`   (run all tests)