# 💼 MiniJobPortal — Full Stack MERN Job Portal

A complete **Full Stack MERN Job Portal** built using **MongoDB, Express.js, React.js, and Node.js**. The platform supports separate recruiter and candidate workflows with authentication, job posting, resume uploads, interview scheduling, application tracking, email notifications, company logos, and advanced search features.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT-based Authentication
* Secure Password Hashing using bcrypt
* Role-based Access Control

  * Recruiter
  * Candidate

---

### 👨‍💼 Recruiter Features

* Recruiter Registration & Login
* Post New Jobs
* Upload Company Logos
* Edit Existing Jobs
* Delete Jobs
* View Applications
* Download/View Candidate Resumes
* Recruiter Dashboard Statistics
* Add Recruiter Notes
* Update Application Status
* Schedule Interviews
* Edit Interview Schedule
* Cancel Interviews
* Email Notifications on New Applications

---

### 👨‍🎓 Candidate Features

* Candidate Registration & Login
* Browse Jobs
* Search Jobs
* Save Jobs
* Apply for Jobs
* Upload Resume (PDF/DOC/DOCX)
* Candidate Dashboard
* Edit Profile
* View Applied Jobs
* Track Application Status
* View Interview Schedule
* Access Meeting Links

---

### 🔎 Advanced Job Search

* Search by Job Title
* Search by Company
* Filter by Location
* Filter by Salary Range
* Filter by Job Type
* Sorting Options
* Pagination

---

### 📂 File Upload Features

* Resume Upload

  * PDF
  * DOC
  * DOCX
* Company Logo Upload
* Multer-based File Storage

---

### 📧 Email Notification System

When a candidate applies:

* Recruiter receives an email automatically.
* Email contains:

  * Applicant Name
  * Email
  * Phone Number
  * Job Title
  * Company Name

Implemented using:

* NodeMailer
* Gmail SMTP

---

## 🎯 Applicant Tracking System (ATS)

The portal includes a complete Applicant Tracking System.

Application stages:

* Applied
* Under Review
* Shortlisted
* Interview Scheduled
* Rejected
* Hired

Recruiters can:

* Update candidate status
* Add recruiter notes
* Schedule interviews
* Manage interview details

Candidates can:

* View application progress
* Track interview schedules
* Access online meeting links

---

### 🎨 User Interface

* Responsive Design
* Dark Mode
* Light Mode
* Modern Dashboard UI
* Mobile Friendly

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router DOM
* CSS3
* Fetch API

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT
* bcryptjs

### File Upload

* Multer

### Email Service

* NodeMailer

---

## 📂 Project Structure

```text
MiniJobPortal/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── context/
│   │
│   └── public/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   │   ├── resumes/
│   │   └── logos/
│   └── server.js
│
├── screenshots/
│   ├── 1.png
│   ├── 2.png
│   ├── 3.png
│   ├── 4.png
│   ├── 5.png
│   ├── 6.png
│   ├── 7.png
│   ├── 8.png
│   └── 9.png
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/mounikakorrakuti1/ASSG-13.git
cd ASSG-13
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file inside `server/`

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

# 📸 Project Screenshots

## 1. Candidate Dashboard – Applied Jobs & Interview Schedule

![Screenshot 1](screenshots/1.png)

Candidates can track applications, monitor status updates, and view interview schedules.

---

## 2. Candidate Dashboard – Profile Management

![Screenshot 2](screenshots/2.png)

Candidates can manage profile information including skills, experience, and location.

---

## 3. Recruiter Application Management

![Screenshot 3](screenshots/3.png)

Recruiters can manage candidates, add notes, and schedule interviews.

---

## 4. Application Status Tracking System (ATS)

![Screenshot 4](screenshots/4.png)

Recruiters can update application status through multiple recruitment stages.

---

## 5. Job Applications List

![Screenshot 5](screenshots/5.png)

Displays all applications received for a job with resume access and management features.

---

## 6. Post New Job

![Screenshot 6](screenshots/6.png)

Recruiters can create job listings and upload company logos.

---

## 7. Recruiter Dashboard

![Screenshot 7](screenshots/7.png)

Shows job statistics, application counts, and recruitment analytics.

---

## 8. Browse Jobs Page

![Screenshot 8](screenshots/8.png)

Candidates can search, filter, and browse available jobs.

---

## 9. Job Application Form

![Screenshot 9](screenshots/9.png)

Candidates can apply for jobs and upload resumes.

---

## 🔒 Security Features

* Password Hashing using bcrypt
* JWT Authentication
* Protected Routes
* Role-based Authorization
* File Type Validation
* Input Validation
* Duplicate Application Prevention

---

## 📈 Future Enhancements

* Cloudinary Integration
* Resume Parsing
* AI Resume Screening
* Job Recommendation System
* Real-time Notifications
* Admin Dashboard
* Video Interview Integration
* Resume Ranking using AI

---

## 👨‍💻 Developed By

**Mounika Korrakuti**

SRKR Engineering College

Department of Computer Science & Engineering

---

## ⭐ Project Highlights

✅ JWT Authentication

✅ Role-Based Access Control

✅ Applicant Tracking System (ATS)

✅ Resume Upload

✅ Company Logo Upload

✅ Email Notifications

✅ Recruiter Dashboard

✅ Candidate Dashboard

✅ Saved Jobs

✅ Interview Scheduling

✅ Recruiter Notes

✅ Application Status Tracking

✅ Candidate Applied Jobs Dashboard

✅ Advanced Search & Filters

✅ Pagination

✅ Dark/Light Mode

✅ MongoDB Integration

✅ REST API Architecture
