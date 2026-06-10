# 💼 MiniJobPortal — Full Stack MERN Assignment

A complete Job Portal application where **recruiters can post jobs** and **candidates can browse and apply**. Built with React, Node.js, Express, and MongoDB.

---

## 🗂 Folder Structure

```
job-portal/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobForm.jsx
│   │   │   ├── ApplyForm.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── ConfirmModal.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── PostJobPage.jsx
│   │   │   ├── JobDetailPage.jsx
│   │   │   ├── EditJobPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
└── server/                    # Node.js + Express Backend
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Job.js
    │   └── Application.js
    ├── controllers/
    │   ├── jobController.js
    │   └── applicationController.js
    ├── routes/
    │   └── jobRoutes.js
    ├── server.js
    ├── .env
    └── package.json
```

---

## ⚙️ Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React 18, Vite, React Router v6 |
| Hooks     | useState, useEffect, custom useDebounce |
| Styling   | Plain CSS with CSS Variables (light + dark) |
| HTTP      | Fetch API                   |
| Backend   | Node.js, Express.js         |
| Database  | MongoDB, Mongoose           |
| Dev Tools | nodemon, dotenv, cors       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local install or MongoDB Atlas)
- npm

---

### 1. Clone / Download the Project

```bash
git clone <your-repo-url>
cd job-portal
```

---

### 2. Setup & Run the Backend

```bash
cd server
npm install
```

Edit `.env` to set your MongoDB URI:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/minijobportal
NODE_ENV=development
```

Start the backend:

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

✅ Server will run at: `http://localhost:5000`

---

### 3. Setup & Run the Frontend

```bash
cd ../client
npm install
npm run dev
```

✅ Frontend will run at: `http://localhost:5173`

---

## 🔗 API Endpoints

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | `/api/jobs`                  | Get all jobs (search, filter, sort, paginate) |
| POST   | `/api/jobs`                  | Create a new job posting             |
| GET    | `/api/jobs/:id`              | Get a single job by ID               |
| PUT    | `/api/jobs/:id`              | Update/edit an existing job          |
| DELETE | `/api/jobs/:id`              | Delete a job (also deletes its applications) |
| POST   | `/api/jobs/:id/apply`        | Submit a job application             |
| GET    | `/api/jobs/:id/applications` | Get all applications for a job       |

### Query Parameters for `GET /api/jobs`

| Param    | Example              | Description              |
|----------|----------------------|--------------------------|
| `search` | `?search=developer`  | Search by title or company |
| `jobType`| `?jobType=Full Time` | Filter by job type       |
| `sortBy` | `?sortBy=salary_desc`| Sort by salary           |
| `page`   | `?page=2`            | Page number (default: 1) |
| `limit`  | `?limit=9`           | Results per page (default: 9) |

---

## ✅ Features

### Core Features
- ✅ Create, View, Edit, Delete Job Postings
- ✅ Apply for Jobs (name, email, phone)
- ✅ View all Applications per Job
- ✅ Search by Job Title & Company Name
- ✅ Filter by Job Type (Full Time / Part Time / Contract)
- ✅ Form Validation (required fields, email, phone, numeric salary)
- ✅ Loading spinners, error states, empty states

### Bonus Features
- 🌙 Dark Mode Toggle (persisted via localStorage)
- 📄 Pagination (9 jobs per page)
- 💰 Sort by Salary (High→Low / Low→High)
- 📱 Fully Responsive Design (mobile + tablet + desktop)
- 🚫 Duplicate application prevention (same email per job)
- 🗑️ Cascade delete (deletes applications when job is deleted)

---

## 📋 Form Validation Rules

| Field       | Rule                                    |
|-------------|-----------------------------------------|
| All fields  | Required — no empty values allowed      |
| Email       | Must match valid email format           |
| Phone       | 10-digit Indian number or international |
| Salary      | Must be a non-negative number           |
| Job Type    | Must be Full Time / Part Time / Contract |

---

## 🗃️ MongoDB Models

### Job
```
title, company, location, jobType, salary, description, timestamps
```

### Application
```
job (ref: Job), fullName, email, phone, timestamps
Unique index on (job + email) — prevents duplicate applications
```

---

## 👩‍💻 Author

**Student Name:** ___________________  
**Roll No:** ___________________  
**Branch:** CSE  
**College:** SRKR Engineering College, Bhimavaram  
**Assignment:** Full Stack MERN — Mini Job Portal  
