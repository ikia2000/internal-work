# Internal Work Manager (MVP)

A minimal, production-ready starter for an internal portal where users can **log in** and **manage their work (tasks)**.

## Stack
- **Backend:** Node.js + Express + Prisma (SQLite), JWT auth
- **Frontend:** React + Vite + Tailwind
- **Auth:** Email + Password (bcrypt) with JWT
- **Roles:** USER, ADMIN (admin can see all tasks)

## Quick Start

### 1) Server
```bash
cd server
cp .env.example .env
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
- Default API: `http://localhost:5000`
- Endpoints:
  - `POST /auth/register` `{ name, email, password }`
  - `POST /auth/login` `{ email, password }` → `{ token, user }`
  - `GET /tasks` (auth) → list tasks (ADMIN sees all)
  - `POST /tasks` (auth) → create task
  - `PUT /tasks/:id` (auth) → update task
  - `DELETE /tasks/:id` (auth) → delete task

### 2) Client
```bash
cd client
cp .env.example .env
npm i
npm run dev
```
- Default UI: `http://localhost:5173`
- Configure `VITE_API_URL` in `client/.env` to point to the server.

## Notes
- Change `JWT_SECRET` in `server/.env`.
- Switch to PostgreSQL by updating `DATABASE_URL` and `prisma/schema.prisma` provider to `postgresql`.
- To create an admin quickly, after registering a user run:
  ```bash
  npx prisma studio
  ```
  and change the `role` to `ADMIN` for that user.
