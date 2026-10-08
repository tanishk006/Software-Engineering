# Smart Campus Portal

An enterprise-grade, full-stack collegiate campus management platform designed to centralize academic, administrative, and student life operations.

Built with **React 19 + Tailwind CSS**, **Node.js + Express REST APIs**, and **MySQL 8.0+ Relational Persistence**.

---

## 🚀 Quick Links & Documentation

- 📖 **[User Guide & Role Walkthroughs (USER_GUIDE.md)](./USER_GUIDE.md)**: Pre-seeded credentials, step-by-step user flows (Student, Staff, Faculty, Admin), and feature verification guides.
- 📐 **[Software Requirements Specification (SRS Document)](./docs/SRS_DOCUMENT.md)**: Full IEEE Std 830-1998 compliant SRS with all 8 mandatory architecture diagrams (Use Case, DFD L0/L1, ERD, Activity, Sequence, Class, Deployment, Context).
- 🖨️ **[Interactive HTML & Print-to-PDF Document](./docs/SRS_DOCUMENT.html)**: Standalone HTML viewer with embedded Mermaid diagram rendering and one-click PDF export.

---

## 🔑 Pre-Seeded Login Credentials

All pre-seeded test accounts use the password: **`Password@123`**

| Role | Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Prof. Vikramaditya Sen | `admin@campus.edu` | `Password@123` |
| **Faculty** | Dr. Ananya Sharma | `ananya.sharma@campus.edu` | `Password@123` |
| **Faculty** | Prof. K. R. Ramanathan | `kr.ramanathan@campus.edu` | `Password@123` |
| **Staff / Technician** | Ramesh Babu *(Facilities)* | `ramesh.babu@campus.edu` | `Password@123` |
| **Staff / Technician** | Sunita Deshmukh *(IT/Network)* | `sunita.deshmukh@campus.edu` | `Password@123` |
| **Student** | Rohan Sengupta | `rohan.sengupta@campus.edu` | `Password@123` |
| **Student** | Priya Nambiar | `priya.nambiar@campus.edu` | `Password@123` |
| **Student** | Aditya Vardhan | `aditya.vardhan@campus.edu` | `Password@123` |
| **Student** | Tanvi Agarwal | `tanvi.agarwal@campus.edu` | `Password@123` |

---

## 🛠️ Quick Start

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
*(Runs on `http://localhost:5000`)*

### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

For complete details on navigating every feature, see **[USER_GUIDE.md](./USER_GUIDE.md)**.
