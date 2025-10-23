# PPK PayPal-Like App (with Security Review)

A secure, full-stack web application demonstrating **registration**, **login** with **CSRF + throttling**, and **Two-Factor Authentication (TOTP 2FA)** — built with **Laravel 12 (Sanctum)**, **React + Vite + Tailwind**, and **PostgreSQL 15**, containerized via **Docker Compose**.

> **Palette (UI):** `#52357B #5459AC #648DB3 #B2D8CE`  
> **Root folder:** `C:\Pinoy-Paypal` (Windows + PowerShell + VS Code)

---

## 1) Project Overview
- Developer goal: implement secure auth + optional email verification + full TOTP 2FA flow (setup QR, verify, login challenge, disable).
- Reviewer goal: audit using a checklist (auth, session/token, input validation, secure config, logging, HTTPS).

## 2) Tech Stack
- **Backend:** Laravel 12 (PHP 8.3), **Sanctum**, Google2FA package, CORS middleware  
- **Frontend:** React (Vite), TailwindCSS, Axios, React Router, Context/Redux (Auth)  
- **Database:** PostgreSQL 15  
- **Runtime:** Docker Compose (services: `backend`, `frontend`, `db`)

## 3) Core Features
- Registration (full name, email, mobile, password w/ complexity) → **bcrypt** hash
- Login (CSRF + rate limiting) → Dashboard
- **2FA (TOTP):** setup (QR), verify, login challenge, disable (with re-auth)
- Dashboard shows user info, **2FA status**, last login **IP / user agent / time**
- Logout invalidates session/token (Sanctum)

## 4) API (planned)
POST /api/register
POST /api/login
POST /api/logout
GET /api/user
POST /api/2fa/setup
POST /api/2fa/verify
POST /api/2fa/disable

## 5) Folder Structure (top-level)
C:\Pinoy-Paypal
├─ backend/ # Laravel app (to be added in Step 1)
├─ frontend/ # React + Vite app (to be added in Step 2)
├─ docs/ # Design notes, diagrams
├─ review/ # Reviewer checklist PDF + evidence
├─ screenshots/ # UI screenshots (login, dashboard, 2FA)
└─ .github/workflows/ # CI (optional)

markdown
Copy code

## 6) How to Run (will be finalized in Step 5)
1. `docker compose up --build`
2. `docker compose exec backend sh -lc "php artisan migrate --seed"`
3. Frontend: `http://localhost:3000`  
   Backend: `http://localhost:8000`

> **Note:** Docker files and compose will be added in **Step 0d/5a–5e**.

## 7) Security Checklist (Reviewer)
- bcrypt passwords; CSRF + throttle on login; Sanctum tokens; logout invalidates
- Backend + frontend validation; no secrets hard-coded; `.env` used & not committed
- Logs capture last login IP/UA/time; no sensitive errors; HTTPS in prod  
- **Verdict:** PASS / NEEDS IMPROVEMENT (sign + date)

## 8) Milestones (Master Plan Snapshot)
- 0a Root folder ✅
- 0b Git init + `.gitignore` ✅
- 0c README (this file) ⬅
- 0d Compose skeleton
- 1x Backend (Laravel, Sanctum, 2FA endpoints, migrations/seeders)
- 2x Frontend (pages, auth context, Tailwind theme)
- 3x 2FA UI flow
- 4x Security hardening
- 5x Docker finalize & run
- 6x Reviewer checklist pass
- 7x Docs/screenshots
- 8x Presentation build & polish

## 9) Contributing
- One step at a time; commit after each milestone; keep diffs clean.

## 10) License
Private academic project (educational use).