<div align="center">

# 📚 Smart-ERP

### Production-Grade MERN Stack Educational ERP System

**Multi-Role Architecture · Role-Based Access Control · Dashboard-First UX**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=flat-square&logo=mongodb&logoColor=47A248)](https://mern.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](http://makeapullrequest.com)

[Features](#-main-features) · [Roles](#-roles--access-control) · [Demo Access](#-seeded-demo-access) · [Setup](#-local-setup) · [Security](#-security--validation)

<br>

**Built & maintained by [Ambrish Mishra](https://github.com/ambrishmishra847)**

</div>

---

## 📖 Introduction

Smart-ERP centralizes institutional operations — **academics, administration, finance, and communication** — into a single, cohesive platform. Built with scalability and modularity at its core, it supports everything from rapid MVP deployments to full production-ready environments for:

- 🏫 Schools
- 🎓 Colleges & Universities
- 📝 Coaching Institutes
- 🏢 Multi-Campus Organizations

The system features a **multi-role architecture with 15+ distinct roles**, each governed by strict **JWT-based Role-Based Access Control (RBAC)**, ensuring every user sees only what they're authorized to access.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [System Maturity & Roadmap](#-system-maturity--roadmap)
- [Main Features](#-main-features)
- [Roles & Access Control](#-roles--access-control)
- [Seeded Demo Access](#-seeded-demo-access)
- [Quick Login Tips](#-quick-login-tips)
- [Custom Admin Format](#-custom-admin-format)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Terminal Commands](#-terminal-commands)
- [Security & Validation](#-security--validation)
- [Notes for Production](#-notes-for-production)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Tech Stack

### 🎨 Frontend

| Technology | Purpose |
|---|---|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react) | UI Library (Vite) |
| ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss) | Utility-First CSS |
| ![React Router](https://img.shields.io/badge/-React_Router-CA4245?style=flat-square&logo=reactrouter) | Client-Side Routing |
| ![Axios](https://img.shields.io/badge/-Axios-5A29E4?style=flat-square) | HTTP Client |
| ![Recharts](https://img.shields.io/badge/-Recharts-8884D8?style=flat-square) | Data Visualization |
| ![Framer Motion](https://img.shields.io/badge/-Framer_Motion-FF0055?style=flat-square&logo=framer) | Animations |
| ![Lucide](https://img.shields.io/badge/-Lucide_Icons-F56565?style=flat-square) | Icon Library |
| ![React Icons](https://img.shields.io/badge/-React_Icons-8A2BE2?style=flat-square) | Extended Icons |

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js) | Runtime Environment |
| ![Express.js](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express) | Web Framework |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb) | Database |
| ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square) | ODM |
| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens) | Authentication |
| ![bcrypt](https://img.shields.io/badge/-bcrypt-4200FF?style=flat-square) | Password Hashing |
| ![Nodemailer](https://img.shields.io/badge/-Nodemailer-EA4335?style=flat-square&logo=gmail) | Email Service |
| ![Socket.io](https://img.shields.io/badge/-Socket.io-010101?style=flat-square&logo=socket.io) | Real-Time Communication |

### 🔐 Security

| Layer | Implementation |
|---|---|
| **HTTP Headers** | Helmet.js |
| **Rate Limiting** | Express Rate Limit |
| **Audit Trails** | Custom Audit Logging System |
| **Auth** | JWT + bcrypt with salt rounds |

---

## 📈 System Maturity & Roadmap

| Category | MVP Completion | Production Readiness |
|:---|:---:|:---:|
| ![Security](https://img.shields.io/badge/Security_&_Auth-85%25|45%25-yellow?style=flat-square) | 85% | 45% |
| ![Academics](https://img.shields.io/badge/Academics-80%25|55%25-yellow?style=flat-square) | 80% | 55% |
| ![Student](https://img.shields.io/badge/Student_Lifecycle-70%25|40%25-yellow?style=flat-square) | 70% | 40% |
| ![Finance](https://img.shields.io/badge/Finance_HR-50%25|30%25-orange?style=flat-square) | 50% | 30% |
| ![Infra](https://img.shields.io/badge/Infrastructure-40%25|20%25-red?style=flat-square) | 40% | 20% |

### 🚀 Planned Features

> [!TIP]
> These features are on the roadmap and will be implemented in upcoming releases.

- 🔑 **Refresh Token + HttpOnly Cookie Authentication** — More secure session management
- 🔒 **Attendance Lock/Freeze System** — Prevent post-deadline modifications
- 📊 **SGPA/CGPA Automation** — Auto-calculation from grade entries
- 💳 **Razorpay / Stripe Integration** — Online fee payment processing
- ⚡ **Redis + BullMQ** — Background job queues for emails, reports, and bulk operations
- 📁 **AWS S3 / Cloudinary** — Scalable file storage for documents and media

---

## 🚀 Main Features

### 🔐 Authentication & Access
- **Multi-Identifier Login** — Sign in with Email, Username, Roll No, or Employee Code
- **JWT-based RBAC** — Granular permissions per role per module
- **Account Lockout** — Automatic lock after repeated failed attempts
- **Audit Logging** — Full trail of administrative actions in the Admin UI

### 📚 Academic Management
- **Visual Timetable Builder** — Drag-and-drop with automatic conflict detection
- **Subject-wise Attendance Tracking** — Daily/weekly/monthly views with percentage alerts
- **Study Material Mapping** — Organize PDFs, PPTs, and YouTube links by subject & chapter
- **Grade & Mark Management** — Entry, editing, and report card generation

### 🎓 Student Lifecycle
- **Admission Workflow Automation** — Application → Screening → Enrollment pipeline
- **Student Profile Management** — Academic history, documents, and guardians
- **Placement Tracking** — Company visits, offers, and placement statistics

### 💰 Finance & HR
- **Fee Management** — Structure definition, collection tracking, and receipts
- **Payroll Basics** — Salary structure and payment records
- **Expense Tracking** — Department-wise expense categorization

### 📡 Communication & Real-Time
- **Real-Time Notifications** — Instant alerts via Socket.io
- **Role-Based Messaging** — Targeted emails to specific roles via Nodemailer
- **Announcement System** — Institution-wide and department-specific broadcasts

---

## 👥 Roles & Access Control

Smart-ERP implements **15+ distinct roles** organized into four tiers. Each role has precisely scoped permissions — from full system control to read-only student access.

```
┌─────────────────────────────────────────────────────────┐
│                    TIER 1: GOVERNANCE                    │
│  Super Admin · Director/Principal · System Admin         │
├─────────────────────────────────────────────────────────┤
│                   TIER 2: ACADEMIC LEADERSHIP             │
│  Registrar · HOD · Admission Cell                        │
├─────────────────────────────────────────────────────────┤
│                   TIER 3: OPERATIONS                      │
│  Faculty · Accountant · HR Manager · Placement Cell       │
│  Librarian · Hostel Warden · Transport Manager            │
├─────────────────────────────────────────────────────────┤
│                   TIER 4: END USERS                       │
│  Student · Parent/Guardian                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Seeded Demo Access

> [!WARNING]
> Running `npm run seed` will **completely wipe** the database and recreate all demo accounts below. Do NOT run this in a production environment.

### 🏢 Tier 1 — Administrative & Management

| Role | Name | Login Identifier | Password |
|:---|:---|:---|:---|
| **Super Admin** | Aarav Sharma | `admin@smarterp.edu` | `Admin@123` |
| **Director / Principal** | Dr. Niharika Bose | `director@smarterp.edu` | `Leader@123` |
| **System Admin** | Aditi Rao | `sysadmin@smarterp.edu` | `System@123` |
| **Registrar** | Karan Malhotra | `registrar@smarterp.edu` | `Admin@123` |

### 🎓 Tier 2 — Academic & Departmental

| Role | Name | Email | Alt ID (Emp Code) | Password |
|:---|:---|:---|:---|:---|
| **Admission Cell** | Ishita Anand | `admissions@smarterp.edu` | — | `Admin@123` |
| **HOD (CS)** | Drishti Rao | `hod.cs@smarterp.edu` | `HOD-401` | `Faculty@123` |
| **Faculty / Professor** | Meera Verma | `faculty@smarterp.edu` | `FAC-104` | `Teacher@123` |

### ⚙️ Tier 3 — Operations & Support

| Role | Name | Email | Alt ID | Password |
|:---|:---|:---|:---|:---|
| **Accountant** | Pawan Tiwari | `accountant@smarterp.edu` | `ACC-204` | `Finance@123` |
| **HR Manager** | Sonal Kapoor | `hr@smarterp.edu` | `HR-118` | `HR@12345` |
| **Placement Cell** | Pooja Menon | `placement@smarterp.edu` | `PLC-510` | `Placement@123` |
| **Librarian** | Rakesh Suri | `library@smarterp.edu` | — | `Library@123` |
| **Hostel Warden** | Savita Nair | `hostel@smarterp.edu` | — | `Hostel@123` |
| **Transport Manager** | Prakash Jain | `transport@smarterp.edu` | — | `Transport@123` |

### 👨‍🎓 Tier 4 — End Users

| Role | Name | Email | Alt ID (Roll No) | Password |
|:---|:---|:---|:---|:---|
| **Student** | Riya Singh | `student@smarterp.edu` | `BCA24017` | `Student@123` |
| **Parent / Guardian** | Anita Singh | `parent@smarterp.edu` | — | `Parent@123` |

---

## ⚡ Quick Login Tips

Smart-ERP supports **multi-identifier authentication** — you can log in using any of the identifiers configured for a role:

| Login As | Use This Identifier | Why It Works |
|:---|:---|:---|
| Student | `BCA24017` | Roll number mapped to student record |
| HOD | `HOD-401` | Employee code mapped to faculty record |
| Accountant | `ACC-204` | Employee code mapped to staff record |
| Any Admin | `admin@smarterp.edu` | Email mapped to admin record |

> [!NOTE]
> The login system automatically detects the identifier type (email vs. username vs. roll no vs. employee code) and routes authentication accordingly.

---

## 🧑‍💻 Custom Admin Format

Create additional admin accounts on-the-fly via the CLI:

```bash
npm run create-admin -- "John Doe" john_doe password123
```

**Output:**
```
✅ Admin created successfully!

Generated credentials:
  Email:    john_doe@smarterp.local
  Password: (as defined in command)
```

> [!CAUTION]
> - Custom admins are **NOT** stored in seed data
> - They **will be removed** after running `npm run seed`
> - Use this feature only for temporary/development access

---

## ⚙️ Local Setup

### 📋 Prerequisites

| Requirement | Minimum Version | Recommended |
|:---|:---|:---|
| Node.js | 18+ | 20 LTS |
| MongoDB | 6.0+ | 7.0 (Local or Atlas) |
| npm | 9+ | 10+ |
| Gmail Account | — | For App Password (SMTP) |

### 🔧 Backend Setup

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create environment file from template
cp .env.example .env

# 4. Seed the database with demo data
npm run seed

# 5. Start the development server
npm run dev
```

> Server starts at `http://localhost:5000`

### 🎨 Frontend Setup

```bash
# 1. Navigate to the client directory (in a new terminal)
cd client

# 2. Install dependencies
npm install

# 3. Create environment file from template
cp .env.example .env

# 4. Start the development server
npm run dev
```

> Client starts at `http://localhost:5173`

### ✅ Verify Setup

1. Open `http://localhost:5173` in your browser
2. Log in with any seed credential from the [Demo Access](#-seeded-demo-access) section
3. Verify real-time notifications by logging in from two different accounts

---

## 🔐 Environment Variables

### Backend (`server/.env`)

```env
# ── Server ──
PORT=5000

# ── Database ──
MONGODB_URI=mongodb://localhost:27017/smarterp
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/smarterp

# ── Authentication ──
JWT_SECRET=your_jwt_secret_min_32_chars

# ── Email (Gmail SMTP) ──
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
MAIL_FROM=Smart ERP <your_email@gmail.com>

# ── Frontend URL (for CORS) ──
CLIENT_URL=http://localhost:5173
```

<details>
<summary>📌 How to get a Gmail App Password</summary>

1. Go to [Google Account → Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** → Select app: **Mail** → Select device: **Other**
4. Enter "Smart-ERP" as the name
5. Copy the **16-character password** (format: `xxxx xxxx xxxx xxxx`)
6. Paste it in `SMTP_PASS` without spaces

</details>

### Frontend (`client/.env`)

```env
# ── API Base URL ──
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Terminal Commands

### 🚪 Admin Login (CLI)

```bash
npm run admin-login -- admin@smarterp.edu Admin@123
```

### 👤 Create Admin (CLI)

```bash
npm run create-admin -- "Full Name" username password
```

### 🗃️ Seed Database

```bash
npm run seed
```

### ✅ Validate Controller Syntax

```bash
node --check src/controllers/erpController.js
node --check src/controllers/dashboardController.js
```

---

## 🛡 Security & Validation

| Feature | Description | Status |
|:---|:---|:---:|
| **Audit Logging** | All admin actions logged and viewable in Admin UI | ✅ |
| **Account Lockout** | Account locks after N failed login attempts | ✅ |
| **API Rate Limiting** | Prevents brute-force and abuse | ✅ |
| **Helmet Headers** | Secures HTTP headers (XSS, CSRF, etc.) | ✅ |
| **Password Hashing** | bcrypt with configurable salt rounds | ✅ |
| **JWT Expiry** | Token expiration with planned refresh rotation | ✅ |
| **Input Sanitization** | MongoDB injection prevention via Mongoose | ✅ |

### Code Validation

Run syntax checks before committing:

```bash
# Validate all controllers
node --check src/controllers/*.js

# Validate all routes
node --check src/routes/*.js

# Validate middleware
node --check src/middleware/*.js
```

---

## 📝 Notes for Production

> [!IMPORTANT]
> The following changes **MUST** be made before deploying to production.

### Required Changes

- [ ] **File Storage** — Replace local file uploads with **AWS S3** or **Cloudinary**
- [ ] **Authentication** — Migrate to **HttpOnly cookie-based** JWT with refresh tokens
- [ ] **Environment Variables** — Never commit `.env` files; use a secrets manager
- [ ] **CORS** — Restrict `CLIENT_URL` to your actual production domain
- [ ] **MongoDB** — Enable authentication, use Atlas with IP whitelisting
- [ ] **HTTPS** — Use a reverse proxy (Nginx) with SSL/TLS certificates

### Recommended Changes

- [ ] **Redis Caching** — Cache frequently accessed data (dashboards, timetables)
- [ ] **BullMQ Jobs** — Offload emails, reports, and bulk operations to background workers
- [ ] **CDN** — Serve static assets via CloudFront or similar
- [ ] **Logging** — Integrate Winston or Pino with log rotation
- [ ] **Monitoring** — Add health check endpoints and uptime monitoring
- [ ] **Backup Strategy** — Automated MongoDB backups with point-in-time recovery

### Import Guardrails

When importing bulk data (students, faculty, etc.):

```js
// ALWAYS validate before bulk insert
const { error } = bulkImportSchema.validate(importData);
if (error) throw new ValidationError(error.details);

// ALWAYS use transactions for related inserts
const session = await mongoose.startSession();
session.startTransaction();
try {
  // ... operations
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

---

## 🧪 Troubleshooting

| Issue | Possible Cause | Solution |
|:---|:---|:---|
| **Server not starting** | Missing `.env` or invalid config | Run `cp .env.example .env` and fill all values |
| **MongoDB connection error** | Incorrect URI or service down | Verify `MONGODB_URI`; check if MongoDB is running (`mongod` or Atlas status) |
| **Email not working** | Invalid SMTP credentials | Generate a new [Gmail App Password](#-how-to-get-a-gmail-app-password) |
| **Login fails after seed** | Stale JWT or browser cache | Clear browser localStorage/cookies; re-run `npm run seed` |
| **CORS errors** | Mismatched `CLIENT_URL` | Ensure `CLIENT_URL` in backend `.env` matches frontend URL exactly |
| **Socket.io not connecting** | Wrong transport or port | Verify `VITE_API_URL` doesn't have trailing slash |
| **404 on API calls** | Route mismatch | Check that `VITE_API_URL` includes `/api` suffix |
| **Dashboard data empty** | No seed data | Run `npm run seed` in the `server` directory |
| **File upload fails** | Missing upload directory or disk full | Ensure `uploads/` directory exists with write permissions |
| **Rate limit hit (429)** | Too many requests during testing | Increase limit in dev or wait for window reset |

<details>
<summary>🔧 Advanced: Reset Everything</summary>

If nothing else works, perform a clean reset:

```bash
# 1. Stop all running servers (Ctrl+C)

# 2. Clean install backend
cd server
rm -rf node_modules package-lock.json
npm install
cp .env.example .env
# Edit .env with correct values
npm run seed
npm run dev

# 3. Clean install frontend (new terminal)
cd client
rm -rf node_modules package-lock.json
npm install
cp .env.example .env
npm run dev

# 4. Clear browser data
# Go to DevTools → Application → Clear Storage → Clear site data
```

</details>

---

<div align="center">

---

## ⭐ Smart-ERP

**A scalable, modular, and production-ready ERP system designed to modernize educational institutions with real-time capabilities and strong RBAC security.**

<br>

<a href="https://github.com/ambrishmishra847">
  <img src="https://img.shields.io/badge/Author-Ambrish_Mishra-blue?style=for-the-badge&logo=github" alt="Ambrish Mishra" />
</a>

<br><br>

[Report Bug](../../issues) · [Request Feature](../../issues) · [Contribute](../../pulls)

---

</div>
