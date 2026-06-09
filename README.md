# HealthBridge Web

React + TypeScript + CSS web experience for HealthBridge.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Demo Users

Run the backend seed script, then use seeded backend credentials on `/signin`. Password for seeded users: `Password123!`.

Useful accounts:

- `patient@healthbridge.test`
- `doctor@mercy.test`
- `admin@mercy.test`
- `superadmin@healthbridge.test`
- `emt@healthbridge.test`

The landing page uses real clinical imagery and branded HealthBridge logo/favicon assets. Auth, signup, role dashboards, consent revoke, emergency access, and patient records now call the backend API.
