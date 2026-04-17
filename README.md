# Smart-ERP

Smart-ERP is a production-style MERN stack Educational ERP for schools, colleges, coaching institutes, and universities. It includes role-based access, academic operations, attendance, assignments, placements, notifications, analytics, and a simplified dashboard-first user experience.

## Tech Stack

- Frontend: React, Vite, TailwindCSS, React Router, Axios, Recharts, Framer Motion, React Icons
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Nodemailer, Socket.io

## Roles

- Super Admin: full control across users, academics, timetable, attendance, announcements, placements, fees, exams, results, analytics, and study materials
- Teacher: partial operational control for attendance, assignments, announcements, placements, student reports, exams/results, and study materials for assigned courses
- Student: limited access to timetable, assignments, attendance, results, fees, announcements, placements, and study materials
- Parent: visibility into child attendance, results, fees, and announcements

## Main Features

- Role-based login and protected routing
- Dashboard overview for each role
- Admin user creation and management
- Separate student management and teacher management flows
- Course and subject management
- Table-based timetable with conflict checks
- Subject-based attendance with monthly filtering
- Student attendance percentage and calendar view
- Teacher individual and collective student attendance reports
- Assignment creation and student submission tracking
- Study materials section for PDFs, YouTube videos, PPTs, Word docs, and links
- Announcements with in-app notifications and Gmail delivery through Nodemailer
- Placement management and student applications
- Exam and result publishing
- Parent visibility for attendance and results
- Real-time notifications with a bell popup
- Analytics and live dashboard refresh

## Project Structure

- [client](/C:/Users/Ambrish%20Mishra/OneDrive/Documents/New%20project/client): React frontend
- [server](/C:/Users/Ambrish%20Mishra/OneDrive/Documents/New%20project/server): Express backend

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB local or MongoDB Atlas
- Gmail account with app password if you want announcement emails

### Backend Setup

```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

The backend will run on `http://localhost:5000`.

### Frontend Setup

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Environment Variables

### Server

Add these values in `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
MAIL_FROM=Smart ERP <your_gmail_address>
CLIENT_URL=http://localhost:5173
```

### Client

Add this to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo Access

After `npm run seed`, you can use:

- Admin: `admin@smarterp.edu` / `Admin@123`
- Teacher: `T-104` / `Teacher@123`
- Student: `BCA24017` / `Student@123`
- Parent: `parent@smarterp.edu` / `Parent@123`

## Terminal Commands

### Login as admin from terminal

```bash
cd server
npm run admin-login -- admin@smarterp.edu Admin@123
```

This returns a valid admin token from the terminal.

### Create a new admin from terminal

```bash
cd server
npm run create-admin -- "Admin Name" username password
```

Example:

```bash
cd server
npm run create-admin -- "Riya Singh" riyaadmin StrongPass@123
```

This creates:

- name: `Riya Singh`
- username: `riyaadmin`
- email: `riyaadmin@smarterp.local`
- role: `super-admin`

You can then sign in with the username or email plus password.

## How To Use Key Modules

### Admin

- Create teacher, student, and parent users
- Manage courses, subjects, timetable, exams, results, fees, announcements, placements, and materials
- Open student management to inspect student reports
- Use analytics for institution-wide summaries

### Teacher

- Mark attendance by selecting course and subject
- Search students and inspect their reports
- Create assignments and review submissions
- Upload study materials for assigned courses
- Publish announcements and placements

### Student

- View attendance percentage and calendar
- Track assignments and submissions
- Open timetable, results, fees, announcements, placements, and materials

### Parent

- Review child attendance
- Monitor results and fee records
- Read announcements

## Email Announcements

Announcements are delivered in two ways:

- inside the app as notifications
- through Gmail using Nodemailer

To enable Gmail delivery, `SMTP_USER` and `SMTP_PASS` must be valid. For Gmail, use an App Password instead of your normal password.

## Real-Time Updates

- Socket.io sends new notifications live
- dashboard overview refreshes automatically
- bell icon shows the latest news and has `Mark as seen` support

## Validation

Useful checks:

```bash
cd server
node --check src/controllers/erpController.js
node --check src/controllers/dashboardController.js
```

```bash
cd client
npm run build
```

## Notes

- This project is designed so anyone can run it locally with Node, MongoDB, and the provided setup steps
- If you want public/shared access beyond localhost, deploy the frontend and backend to a hosting provider and point `VITE_API_URL` and `CLIENT_URL` to the deployed URLs
- For production, add proper file uploads, cloud storage, pagination, edit/update flows, and deployment secrets management
