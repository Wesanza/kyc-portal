
# Employee KYC Portal

A full-stack internal HR/Compliance web application built to explore and demonstrate key backend engineering concepts: async task queues, caching strategies, real-time notifications, JWT auth flows, secure file storage, and role-based access control, within a realistic, end-to-end product context.
<img width="1052" height="630" alt="image" src="https://github.com/user-attachments/assets/af0ebaa7-250d-4656-84a6-8d930256d9e1" />

<img width="924" height="753" alt="image" src="https://github.com/user-attachments/assets/1509b9ea-67fc-4bd0-9132-83d1a8d4dcc7" />


## What This Project Demonstrates

| Concept                             | Implementation                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| **Async task queues**         | Celery + Redis broker for all email dispatches and notification fanout                        |
| **Caching**                   | Redis-backed Django cache for KYC status aggregation and invite validation                    |
| **JWT authentication**        | SimpleJWT with access/refresh token pair, blacklisting on logout                              |
| **Role-based access control** | Custom DRF permission classes (`IsAdminOnly`,`IsAdminOrHR`,`IsApplicantOwner`)          |
| **Custom auth scheme**        | Invite-token-based applicant sessions via a custom DRF `BaseAuthentication`class            |
| **In-app notifications**      | Generic `Notification`model with recipient polymorphism; polling-based delivery             |
| **Email notifications**       | Async Celery tasks with HTML + plain-text templates; triggered via Django signals             |
| **Secure file storage**       | Private S3 bucket via `django-storages`; short-lived pre-signed URLs; no direct S3 exposure |
| **Status state machine**      | Explicit transition guard on KYC section review (`PENDING → IN_REVIEW → APPROVED            |
| **Audit trail**               | Insert-only `ReviewLog`model; every status change is immutably recorded                     |
| **Singleton settings**        | `InviteSettings.get_solo()`pattern for system-wide config with a single DB row              |
| **Soft delete**               | `is_active`flag on `Applicant`; no hard deletes in the admin workflow                     |
| **React Query + Zustand**     | Optimistic updates, cache invalidation, and persistent auth state on the frontend             |

---

## Tech Stack

### Backend (`kyc_backend/`)

* **Python 3.12** · **Django 5.x** · **Django REST Framework**
* **SimpleJWT** — access + refresh token auth for admin/HR users
* **Celery** — async task queue (email, notifications)
* **Redis** — Celery broker + Django cache backend
* **PostgreSQL** — primary database
* **django-storages + boto3** — S3 file storage (production)
* **django-filter** — queryset filtering on list endpoints
* **python-decouple** — environment variable management

### Frontend (`kyc_frontend/`)

* **React 18** · **TypeScript** · **Vite**
* **Tailwind CSS v3** — utility-first styling with a custom design system
* **TanStack Query (React Query v5)** — server state, caching, optimistic updates
* **Zustand** — client auth state persistence
* **React Hook Form + Zod** — form validation
* **Axios** — typed HTTP client with interceptors
* **Lucide React** — icon set

---

## Project Structure

```
kyc-portal/
├── kyc_backend/        # Django + DRF API
├── kyc_frontend/       # React + TypeScript + Tailwind SPA
├── .env.example        # Environment variable template — copy to .env
├── docker-compose.yml  # Local dev: Django + Postgres + Redis + Celery worker
└── Makefile            # Dev shortcuts
```


### 4. Access the app

| Service      | URL                                 |
| ------------ | ----------------------------------- |
| Frontend     | http://localhost:5173               |
| Backend API  | http://localhost:8000/api/          |
| Django Admin | http://localhost:8000/django-admin/ |

---

## Key API Endpoints

### Auth (Admin/HR)

| Method    | Endpoint                       | Description                        |
| --------- | ------------------------------ | ---------------------------------- |
| POST      | `/api/auth/login/`           | Obtain JWT access + refresh tokens |
| POST      | `/api/auth/logout/`          | Blacklist refresh token            |
| POST      | `/api/auth/refresh/`         | Rotate access token                |
| GET/PATCH | `/api/auth/me/`              | View or update own profile         |
| POST      | `/api/auth/change-password/` | Change password                    |

### Applicant Management (Admin/HR)

| Method    | Endpoint                                         | Description                     |
| --------- | ------------------------------------------------ | ------------------------------- |
| GET/POST  | `/api/admin/applicants/`                       | List or create applicants       |
| GET/PATCH | `/api/admin/applicants/:id/`                   | Retrieve or update an applicant |
| POST      | `/api/admin/applicants/:id/resend-invite/`     | Resend invite email             |
| POST      | `/api/admin/applicants/:id/regenerate-invite/` | Issue a new invite token        |
| GET       | `/api/admin/applicants/:id/kyc-summary/`       | KYC completion summary          |

### KYC Review (Admin/HR)

| Method | Endpoint                                          | Description                         |
| ------ | ------------------------------------------------- | ----------------------------------- |
| GET    | `/api/admin/kyc/:applicant_id/sections/`        | All sections with data + status     |
| PATCH  | `/api/admin/kyc/:applicant_id/:section/review/` | Approve / reject / request revision |
| GET    | `/api/admin/kyc/:applicant_id/review-log/`      | Immutable audit trail               |

### KYC Submission (Applicant)

| Method   | Endpoint                                    | Description                       |
| -------- | ------------------------------------------- | --------------------------------- |
| GET      | `/api/applicant/invite/:token/validate/`  | Validate invite link              |
| POST/PUT | `/api/applicant/kyc/employment-contract/` | Submit employment contract        |
| POST/PUT | `/api/applicant/kyc/payslips/`            | Submit up to 3 certified payslips |
| POST/PUT | `/api/applicant/kyc/identity/`            | Submit KRA PIN + National ID      |
| POST/PUT | `/api/applicant/kyc/home-address/`        | Submit home address               |
| POST/PUT | `/api/applicant/kyc/office-address/`      | Submit office address             |
| POST/PUT | `/api/applicant/kyc/social-media/`        | Submit social media URLs          |
| POST/PUT | `/api/applicant/kyc/contact-details/`     | Submit phone numbers              |
| POST/PUT | `/api/applicant/kyc/next-of-kin/`         | Submit next-of-kin details        |
| GET      | `/api/applicant/kyc/status/`              | Completion status of all sections |

### Settings (Admin)

| Method    | Endpoint                               | Description                       |
| --------- | -------------------------------------- | --------------------------------- |
| GET/PATCH | `/api/admin/settings/notifications/` | Per-user notification preferences |
| GET/PATCH | `/api/admin/settings/invites/`       | System-wide invite configuration  |

---

## KYC Status State Machine

```
                 [Applicant submits]
                        │
                        ▼
                    PENDING
                        │
                 [Admin opens]
                        │
                        ▼
                    IN_REVIEW
                   /    │    \
                  ▼     ▼     ▼
            APPROVED  REJECTED  REVISION_REQUESTED
                                      │
                             [Applicant resubmits]
                                      │
                                      ▼
                                  PENDING  (cycle)
```

**Overall KYC status** is computed from all 8 section statuses:

| Condition                                     | Overall Status         |
| --------------------------------------------- | ---------------------- |
| Any section not yet submitted                 | `INCOMPLETE`         |
| Any section =`REJECTED`                     | `REJECTED`           |
| Any section =`REVISION_REQUESTED`           | `REVISION_REQUESTED` |
| All submitted; some `PENDING`/`IN_REVIEW` | `IN_REVIEW`          |
| All sections =`APPROVED`                    | `APPROVED`           |

---
