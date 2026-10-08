# Smart Campus Portal — Project Flow (Updated Stack)

**Updated Technology Stack:** React.js + Tailwind CSS | Node.js + Express.js (REST APIs) | SQL

## 1. Project Overview

- **Project Name:** Smart Campus Portal
- **Project Type:** Web-based campus management portal
- **Frontend:** React.js + Tailwind CSS (Single Page Application)
- **Backend:** Node.js + Express.js — REST APIs
- **Database:** SQL (MySQL / equivalent RDBMS)
- **Authentication:** JWT (JSON Web Tokens)
- **Communication:** HTTP/HTTPS — JSON over REST APIs

The Smart Campus Portal is a centralized web application that provides students, faculty, administrators, and authorized staff with access to essential campus services through one platform.

The project is based on the supplied Software Requirements Specification (SRS), which defines authentication, role-based access, dashboard, lost and found, events, faculty directory, marketplace, complaints, emergency contacts, campus map, and centralized database management.

The frontend and backend are decoupled: React.js (client) communicates with the Node.js/Express.js backend exclusively through versioned REST APIs (e.g. `/api/v1/...`) that return JSON. This replaces the earlier PHP server-rendered approach with a modern SPA + REST API architecture.

## 2. High-Level System Flow

```
┌──────────────────────┐
│ User opens React     │
│ Smart Campus SPA     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Login / Register     │
│ (React Form + Axios  │
│ POST /api/auth)      │
└──────────┬───────────┘
           │
           │ Send credentials via REST API
           ▼
┌──────────────────────┐
│ Express.js Backend   │
│ Validate + Issue     │
│ JWT Token            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Identify User Role   │
│ (decoded from JWT)   │
└──────────┬───────────┘
           │
   ┌───────┼────────┐
   │       │        │
   ▼       ▼        ▼
┌─────────┐ ┌─────────┐ ┌────────────┐
│ Student │ │ Faculty │ │ Admin      │
└────┬────┘ └────┬────┘ └─────┬──────┘
     │           │             │
     └───────────┼─────────────┘
                 │
                 ▼
┌──────────────────────┐
│ Role-Specific         │
│ React Dashboard       │
└──────────┬───────────┘
           │
   ┌───────┼───────────────┐
   │       │       │        │
   ▼       ▼       ▼        ▼
Lost & Found  Events  Complaints  Marketplace
   │       │       │        │
   └───────┼───────┼────────┘
           │
   ┌───────┼───────────────┐
   │       │       │        │
   ▼       ▼       ▼        ▼
Faculty Directory  Emergency  Campus Map  Admin Management
                   Contacts
           │
           ▼
┌──────────────────────┐
│ Node.js / Express.js │
│ REST API Layer       │
│ Business Logic       │
│ Validation            │
│ JWT Authorization     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ SQL Database          │
│ Centralized Storage   │
└──────────────────────┘
```

## 3. Technology Stack

### Frontend
- React.js — component-based UI, SPA routing (React Router)
- Tailwind CSS — utility-first styling and responsive layout
- Axios / Fetch API — REST API calls to the Express backend
- React Context / Redux (optional) — global state (auth user, role, tokens)
- Client-side form validation (e.g. React Hook Form / Yup, optional)

### Backend
- Node.js — JavaScript runtime for the server
- Express.js — REST API routing, middleware, controllers
- JWT (jsonwebtoken) — stateless authentication tokens
- bcrypt — secure password hashing
- Middleware — authentication guard, role-based authorization guard, input validation, error handling
- SQL driver — Node.js database driver/connection layer to the SQL database

### Database
- SQL (MySQL or equivalent RDBMS)
- Relational database design
- Primary keys and foreign keys
- Referential integrity
- CRUD operations
- Indexed fields for frequently searched data

### Optional File Storage
Images for lost/found items and marketplace products can be stored using server-side file storage (handled by the Express backend, e.g. via an upload middleware), while the database stores their file paths/URLs.

## 4. Complete Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                       │
│                                                            │
│ React.js + Tailwind CSS (SPA)                            │
│ Login | Dashboard | Forms | Tables | Search | Map        │
│ Axios/Fetch → REST API calls                             │
└───────────────────────────┬───────────────────────────────┘
                             │ HTTP / HTTPS (JSON, REST)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                         │
│                                                            │
│ Node.js + Express.js REST API                             │
│                                                            │
│ Authentication (JWT issue/verify)                         │
│ Role-Based Authorization Middleware                       │
│ Input Validation Middleware                                │
│ Business Logic / Controllers                               │
│ CRUD Route Handlers                                         │
│ File Upload Handling (multer or similar)                    │
│ Centralized Error Handling                                  │
└───────────────────────────┬───────────────────────────────┘
                             │ SQL Queries
                             ▼
┌─────────────────────────────────────────────────────────┐
│ DATA LAYER                                                 │
│                                                            │
│ SQL Database                                               │
│ Users | Students | Faculty | Departments | Complaints      │
│ Lost Items | Found Items | Events | Marketplace            │
│ Emergency Contacts | Dashboard                              │
└─────────────────────────────────────────────────────────┘
```

## 5. User Entry Flow

**Step 1 — Open Portal**
The user opens the Smart Campus Portal React SPA through a modern web browser.

**Step 2 — Authentication**
The user enters:
- Email
- Password

The React frontend sends these credentials to the backend via a REST API call: `POST /api/auth/login`.

**Step 3 — Validate Credentials**
The Express.js backend:
- Checks whether the email exists.
- Retrieves the stored password hash.
- Verifies the password using bcrypt.
- Retrieves the user's role.
- Generates a signed JWT access token containing the user id and role.
- Returns the JWT to the frontend (in the response body and/or as an httpOnly cookie).

> Note: Passwords must never be stored as plain text.

**Step 4 — Role Identification**
The system identifies one of the supported roles (decoded from the JWT payload on subsequent requests):
- Student
- Faculty
- Admin
- Non-Faculty / Staff

**Step 5 — Redirect**
The React app stores the JWT (e.g. in memory / httpOnly cookie) and redirects the user, via client-side routing, to the appropriate dashboard according to authorization.

```
Login (React Form)
      │
      ▼
POST /api/auth/login
      │
      ▼
Express: Validate Email + Password
      │
      ├── Invalid ──► 401 Response ──► Show Error in UI
      │
      └── Valid
           │
           ▼
     Generate JWT (with role claim)
           │
           ▼
     Return JWT to React Client
           │
           ▼
     Get User Role (decoded from JWT)
           │
           ├── Student ──► Student Dashboard
           ├── Faculty ──► Faculty Dashboard
           ├── Admin ────► Admin Dashboard
           └── Staff ────► Staff Dashboard
```

## 6. Role-Based Access Flow

Role-based access is enforced server-side by Express authorization middleware that reads the role claim from the verified JWT on every protected route, and reflected client-side in React by conditionally rendering routes/menu items.

**Student** can:
- View dashboard
- Submit complaints
- Track complaint status
- Report lost items
- Report/view found items
- View events
- Search faculty
- List marketplace products
- View marketplace products
- View emergency contacts
- Access campus map

**Faculty** can:
- View dashboard
- View faculty directory
- View events
- Access authorized campus services
- Perform other authorized functions

**Admin** can:
- Manage users
- Manage departments
- Manage complaints
- Assign complaints
- Update complaint status
- Manage events
- Manage emergency contacts
- Manage system records
- Manage authorized campus information

**Non-Faculty / Staff** can:
- Access authorized services
- Manage assigned campus responsibilities
- Update assigned records where permitted

## 7. Dashboard Flow

After login, the React app calls `GET /api/dashboard` (with the JWT in the Authorization header) to fetch role-specific dashboard data:

```
React App (JWT stored)
      │
      ▼
GET /api/dashboard (Authorization: Bearer <JWT>)
      │
      ▼
Express: Verify JWT → Role Verification
      │
      ▼
Return Dashboard JSON
      │
      ▼
React Dashboard Component Renders
      │
      ├── Pending Complaints
      ├── Upcoming Events
      ├── Quick Access
      │
      ├── Lost & Found
      ├── Events
      ├── Faculty Directory
      ├── Marketplace
      ├── Complaints
      ├── Emergency Contacts
      └── Campus Map
```

The dashboard UI is personalized in React according to the logged-in user's role (stored in global state after login).

## 8. Lost and Found Flow

### Lost Item
```
Student (React Form)
      │
      ▼
POST /api/lost-items
      │
      ├── Item Name
      ├── Category
      ├── Description
      ├── Date Lost
      ├── Lost Location
      └── Image
      │
      ▼
Express Middleware: Validation
      │
      ▼
SQL INSERT
      │
      ▼
Lost Item Record
      │
      ▼
JSON Response ──► React Displays Status
```

### Found Item
```
User (React Form)
      │
      ▼
POST /api/found-items
      │
      ├── Item Name
      ├── Category
      ├── Description
      ├── Date Found
      ├── Found Location
      └── Image
      │
      ▼
Express Middleware: Validation
      │
      ▼
SQL INSERT
      │
      ▼
Found Item Record
      │
      ▼
JSON Response ──► React Confirms
```

Users can view item details (`GET /api/lost-items`, `GET /api/found-items`) including: Image, Location, Date, Description, Status.

Lost and found items are maintained as separate records.

## 9. Event Management Flow

### Admin / Authorized User
```
Admin / Authorized User (React Form)
      │
      ▼
POST /api/events
      │
      ├── Event Title
      ├── Description
      ├── Date
      ├── Time
      ├── Venue
      └── Organizer
      │
      ▼
Express: Validate + Authorize (role check)
      │
      ▼
SQL INSERT
      │
      ▼
Events Table (SQL Database)
```

### Student / Faculty
```
User (React View)
      │
      ▼
GET /api/events
      │
      ▼
React Renders Events List
      │
      ├── Upcoming Events
      ├── Event Title
      ├── Description
      ├── Date
      ├── Time
      ├── Venue
      └── Organizer
```

Upcoming events can also appear on the dashboard (fetched via the same `/api/events` endpoint or included in the `/api/dashboard` payload).

## 10. Faculty Directory Flow

```
User (React Search Bar)
      │
      ▼
GET /api/faculty?search=...
      │
      ▼
Express Controller
      │
      ▼
SQL Query: Faculty + Department Data (JOIN)
      │
      ▼
JSON Response
      │
      ▼
React Displays Faculty Details
```

Faculty information includes: Faculty name, Department, Designation, Cabin number.

Users can search faculty information via the query parameters on the REST endpoint.

## 11. Campus Marketplace Flow

### Add Product
```
Student (React Form)
      │
      ▼
POST /api/marketplace
      │
      ├── Product Name
      ├── Category
      ├── Price
      ├── Description
      └── Image
      │
      ▼
Express Validation
      │
      ▼
SQL INSERT
      │
      ▼
Marketplace Listing
```

### View Products
```
User (React View)
      │
      ▼
GET /api/marketplace
      │
      ▼
React Renders Available Products
      │
      ├── Name
      ├── Category
      ├── Price
      ├── Description
      ├── Image
      └── Status
```

## 12. Complaint Management Flow

### Student Complaint Submission
```
Student (React Form)
      │
      ▼
POST /api/complaints
      │
      ├── Complaint Type
      ├── Description
      ├── Location
      └── Date
      │
      ▼
Express Validation
      │
      ▼
SQL INSERT
      │
      ▼
Complaint Status = Pending
```

### Admin / Staff Processing
```
New Complaint
      │
      ▼
Admin / Authorized Staff (React Admin Panel)
      │
      ▼
PATCH /api/complaints/:id/assign
      │
      ▼
Assigned User
      │
      ▼
PATCH /api/complaints/:id/status
      │
      ├── Pending
      ├── Assigned
      ├── In Progress
      ├── Resolved
      └── Closed
      │
      ▼
Student Tracks Status (GET /api/complaints/:id)
```

The SRS requires complaint records to contain complaint type, description, location, reported date, status, and assigned user.

## 13. Emergency Contacts Flow

```
User (React View)
      │
      ▼
GET /api/emergency-contacts?category=...
      │
      ▼
Express Controller → SQL Query
      │
      ▼
React Displays Contact
      │
      ├── Department
      ├── Contact Person
      ├── Phone Number
      └── Email
```

Categories:
- Anti-Ragging
- Women's Cell
- Fire Emergency
- Other Emergency Categories

Admins can manage emergency contact records via `POST`/`PUT`/`DELETE /api/emergency-contacts` (protected, role-checked routes).

## 14. Campus Map Flow

```
User (React View)
      │
      ▼
Campus Map Component
      │
      ▼
GET /api/campus-map (or static/config data)
      │
      ▼
View Campus Layout
      │
      ├── Buildings
      ├── Departments
      ├── Offices
      └── Facilities
```

The map helps users locate important campus locations.

## 15. Admin Management Flow

```
Admin Login (JWT issued, role = admin)
      │
      ▼
React Admin Dashboard
      │
      ├── User Management
      │   ├── POST /api/admin/users
      │   ├── PUT /api/admin/users/:id
      │   ├── GET /api/admin/users
      │   └── PATCH /api/admin/users/:id/role
      │
      ├── Complaint Management
      │   ├── GET /api/complaints
      │   ├── PATCH /api/complaints/:id/assign
      │   └── PATCH /api/complaints/:id/status
      │
      ├── Event Management
      │   ├── POST /api/events
      │   ├── PUT /api/events/:id
      │   └── DELETE /api/events/:id
      │
      ├── Emergency Contacts
      │   ├── POST /api/emergency-contacts
      │   ├── PUT /api/emergency-contacts/:id
      │   └── DELETE /api/emergency-contacts/:id
      │
      └── Other Authorized Records
```

Every admin operation must pass JWT verification and role-based authorization middleware before the database is modified.

## 16. Database Flow

The application uses a centralized SQL database accessed only through the Express.js backend.

```
React Frontend (Form / Action)
      │
      ▼
Axios/Fetch REST Call (JSON)
      │
      ▼
Express.js Route + Middleware
      │
      ├── Verify JWT
      ├── Check Role Authorization
      ├── Validate Input
      └── Prepare SQL Operation
      │
      ▼
SQL Database
      │
      ├── INSERT
      ├── SELECT
      ├── UPDATE
      └── DELETE
      │
      ▼
Query Result
      │
      ▼
Express.js Backend
      │
      ▼
JSON Response
      │
      ▼
React Updates UI
```

## 17. SQL Database Structure

The database structure is unchanged by the stack migration — the same entities, fields, and relationships apply regardless of whether they are accessed via PHP or Node.js/Express.

### 17.1 User
**Purpose:** Stores common authentication and user information.

**Fields:**
- User ID — Primary Key
- Full Name
- Email
- Password (bcrypt hash)
- Phone Number
- Role

**Relationships:**
- User 1 ── 1 Student
- User 1 ── 1 Faculty
- User 1 ── N Found Item
- User 1 ── N Event
- User 1 ── 1 Dashboard

### 17.2 Department
**Fields:**
- Department ID — Primary Key
- Department Name
- HOD Name

**Relationship:**
- Department 1 ── N Faculty

### 17.3 Student
**Fields:**
- Student ID — Primary Key
- User ID — Foreign Key → User
- Roll Number / Class
- Semester

**Relationship:**
- Student 1 ── N Complaint
- Student 1 ── N Lost Item
- Student 1 ── N Marketplace

### 17.4 Faculty
**Fields:**
- Faculty ID — Primary Key
- User ID — Foreign Key → User
- Department ID — Foreign Key → Department
- Designation
- Cabin Number

**Relationship:**
- Department 1 ── N Faculty
- User 1 ── 1 Faculty

### 17.5 Complaint
**Fields:**
- Complaint ID — Primary Key
- Student ID — Foreign Key → Student
- Complaint Type
- Description
- Location
- Date Reported
- Status
- Assigned To — Foreign Key → User

**Relationship:**
- Student 1 ── N Complaint
- User 1 ── N Complaint

### 17.6 Lost Item
**Fields:**
- Lost Item ID — Primary Key
- Student ID — Foreign Key → Student
- Item Name
- Category
- Description
- Date Lost
- Lost Location
- Image
- Status

**Relationship:**
- Student 1 ── N Lost Item

### 17.7 Found Item
**Fields:**
- Found Item ID — Primary Key
- User ID — Foreign Key → User
- Item Name
- Category
- Description
- Date Found
- Found Location
- Image
- Status

**Relationship:**
- User 1 ── N Found Item

### 17.8 Event
**Fields:**
- Event ID — Primary Key
- Event Title
- Event Description
- Event Date
- Event Time
- Venue
- Organizer ID — Foreign Key → User

**Relationship:**
- User 1 ── N Event

### 17.9 Marketplace
**Fields:**
- Product ID — Primary Key
- Student ID — Foreign Key → Student
- Product Name
- Category
- Price
- Description
- Image
- Status

**Relationship:**
- Student 1 ── N Marketplace

### 17.10 Emergency Contact
**Fields:**
- Contact ID — Primary Key
- Department Name
- Contact Person
- Phone Number
- Email
- Category

> Note: This entity does not currently require a foreign key according to the supplied SRS.

### 17.11 Dashboard
**Fields:**
- Dashboard ID — Primary Key
- User ID — Foreign Key → User
- Pending Complaints
- Upcoming Events

**Relationship:**
- User 1 ── 1 Dashboard

## 18. Complete Entity Relationship Flow

```
┌──────────────┐
│ USER         │
│ PK: user_id  │
└──────┬───────┘
       │
   ┌───┼─────────────┐
   │   │             │
   ▼   ▼             ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ STUDENT    │ │ FACULTY    │ │ DASHBOARD  │
└─────┬──────┘ └─────┬──────┘ └────────────┘
      │              │
   ┌──┼───┐          │
   │  │   │          ▼
   ▼  ▼   ▼      ┌─────────────┐
Complaint Lost  Marketplace
   │       │
   │       └──────────────┐
   │                      │
   ▼                      ▼
┌────────────┐      ┌──────────────┐
│ EVENT      │      │ DEPARTMENT   │
└────────────┘      └──────┬───────┘
                            │
                            ▼
                        FACULTY

USER ───────────────► FOUND ITEM
USER ───────────────► COMPLAINT (Assigned To)

EMERGENCY CONTACT
      │
      └── Independent contact records
```

## 19. Backend Node.js / Express.js REST API Request Flow

Every protected operation should follow this general process:

```
React Client Request (Axios/Fetch)
      │
      ▼
Express Route (/api/...)
      │
      ▼
Middleware: Verify JWT (Authorization: Bearer <token>)
      │
      ├── Invalid/Missing Token ──► 401 Unauthorized
      │
      ▼
Middleware: Check User Role
      │
      ├── Unauthorized Role ──► 403 Forbidden
      │
      ▼
Middleware: Validate Request Body / Params
      │
      ├── Invalid ──► 400 Validation Error
      │
      ▼
Controller: Prepare SQL Query
      │
      ▼
Execute SQL Query
      │
      ▼
Check Result
      │
      ├── Failure ──► 500 Error Response
      │
      ▼
Return JSON Result (200 / 201 etc.)
      │
      ▼
React Updates UI / State
```

## 20. CRUD Flow

Most portal modules follow CRUD operations exposed as REST endpoints (e.g. `GET`/`POST`/`PUT`/`PATCH`/`DELETE` on a resource such as `/api/complaints`).

**Create**
```
React Form
→ Axios POST /api/<resource>
→ Express Validation Middleware
→ SQL INSERT
→ Database
→ 201 Created + JSON Response
```

**Read**
```
React Page Request
→ Axios GET /api/<resource>
→ Express Controller
→ SQL SELECT
→ Database
→ 200 OK + JSON Result
→ React Displays
```

**Update**
```
React Edit Form
→ Axios PUT/PATCH /api/<resource>/:id
→ Express Validation Middleware
→ SQL UPDATE
→ Database
→ 200 OK + JSON Response
```

**Delete**
```
React Delete Action
→ Axios DELETE /api/<resource>/:id
→ JWT Authentication Middleware
→ Role Authorization Middleware
→ SQL DELETE
→ Database
→ 200/204 Confirmation
```

> Note: Delete operations should be restricted to authorized users via role-checking middleware.

## 21. Security Flow

```
User Login (React Form)
      │
      ▼
POST /api/auth/login
      │
      ▼
bcrypt Password Hash Verification
      │
      ▼
JWT Generation (signed, includes role claim)
      │
      ▼
Token Returned to Client
      │
      ▼
Subsequent Requests: Authorization: Bearer <JWT>
      │
      ▼
Express Middleware: Verify JWT Signature + Expiry
      │
      ▼
Role Check Middleware
      │
      ▼
Authorized Request Reaches Controller
      │
      ▼
Input Validation
      │
      ▼
Parameterized SQL Queries
      │
      ▼
Database
```

**Security requirements:**
- Store passwords using bcrypt hashing.
- Never store plain-text passwords.
- Use JWT for stateless authentication; set a reasonable token expiry and support refresh tokens if needed.
- Use role-based access control middleware on every protected Express route.
- Validate all user input (both client-side in React and server-side in Express).
- Use parameterized/prepared SQL queries to prevent SQL injection.
- Restrict administrative endpoints to admin-role JWTs only.
- Store JWTs securely on the client (httpOnly cookie preferred over localStorage where possible).
- Validate uploaded images/files (type, size) on the Express backend.
- Maintain database referential integrity.
- Enable CORS with an explicit allow-list for the React frontend origin.
- Use HTTPS in deployment.

## 22. Suggested Project Folder Structure

The project is split into two independent codebases: a React frontend and a Node.js/Express backend, communicating over REST.

### 22.1 Backend (Node.js + Express.js)

```
smart-campus-backend/
│
├── server.js
├── package.json
│
├── config/
│   └── db.js
│
├── middleware/
│   ├── authMiddleware.js (JWT verification)
│   ├── roleMiddleware.js (role-based authorization)
│   ├── validateRequest.js
│   └── errorHandler.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── studentRoutes.js
│   ├── facultyRoutes.js
│   ├── complaintRoutes.js
│   ├── lostFoundRoutes.js
│   ├── eventRoutes.js
│   ├── marketplaceRoutes.js
│   ├── emergencyContactRoutes.js
│   └── dashboardRoutes.js
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── complaintController.js
│   ├── lostFoundController.js
│   ├── eventController.js
│   ├── marketplaceController.js
│   ├── emergencyContactController.js
│   └── dashboardController.js
│
├── models/
│   ├── userModel.js
│   ├── studentModel.js
│   ├── facultyModel.js
│   ├── complaintModel.js
│   ├── lostItemModel.js
│   ├── foundItemModel.js
│   ├── eventModel.js
│   ├── marketplaceModel.js
│   └── emergencyContactModel.js
│
├── uploads/
│   ├── lost-found/
│   └── marketplace/
│
└── database/
    └── smart_campus.sql
```

### 22.2 Frontend (React.js + Tailwind CSS)

```
smart-campus-frontend/
│
├── package.json
├── tailwind.config.js
├── index.html
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── api/
│   │   └── axiosClient.js (base Axios instance, attaches JWT)
│   │
│   ├── context/
│   │   └── AuthContext.jsx (stores JWT, role, user)
│   │
│   ├── routes/
│   │   ├── ProtectedRoute.jsx (role-based route guard)
│   │   └── AppRoutes.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── student/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Complaints.jsx
│   │   │   ├── LostFound.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── FacultyDirectory.jsx
│   │   │   ├── Emergency.jsx
│   │   │   └── CampusMap.jsx
│   │   ├── faculty/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Events.jsx
│   │   │   └── FacultyDirectory.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Complaints.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EmergencyContacts.jsx
│   │   │   └── Departments.jsx
│   │   └── staff/
│   │       ├── Dashboard.jsx
│   │       └── AssignedServices.jsx
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── forms/
│   │
│   └── styles/
│       └── index.css (Tailwind directives)
│
└── public/
```

## 23. Recommended Database, API & SQL Naming

Use consistent naming throughout the React frontend, Express backend, REST API routes, and SQL database.

**SQL Table Names**
- users
- departments
- students
- faculty
- complaints
- lost_items
- found_items
- events
- marketplace
- emergency_contacts
- dashboards

**Primary Key Naming Pattern**
- user_id
- department_id
- student_id
- faculty_id
- complaint_id
- lost_item_id
- found_item_id
- event_id
- product_id
- contact_id
- dashboard_id

> Foreign keys should use the corresponding parent ID.

**REST API Route Naming**
- `/api/auth/login`
- `/api/auth/register`
- `/api/users`
- `/api/users/:id`
- `/api/students/:id`
- `/api/faculty`
- `/api/complaints`
- `/api/complaints/:id`
- `/api/complaints/:id/assign`
- `/api/complaints/:id/status`
- `/api/lost-items`
- `/api/found-items`
- `/api/events`
- `/api/events/:id`
- `/api/marketplace`
- `/api/marketplace/:id`
- `/api/emergency-contacts`
- `/api/dashboard`

> Routes use plural, kebab-case resource names; nested actions (e.g. assign, status) are expressed as sub-routes with PATCH.

## 24. Main Application Flow

```
START
  │
  ▼
Open Smart Campus Portal (React SPA)
  │
  ▼
Login (POST /api/auth/login)
  │
  ├── Invalid Credentials
  │     │
  │     └──► Show Login Error in React UI
  │
  └── Valid Credentials
        │
        ▼
   Receive JWT Token
        │
        ▼
   Identify Role (decoded from JWT)
        │
    ┌───┼──────────────┐
    │   │              │
    ▼   ▼              ▼
Student Faculty    Admin/Staff
    │   │              │
    └───┼──────────────┘
        │
        ▼
   React Dashboard
        │
    ┌───┼──────────────┐
    │                  │
    ▼                  ▼
Campus Services   Admin Services
    │                  │
    ├── Lost & Found   │
    ├── Events         ├── Users
    ├── Faculty        ├── Complaints
    ├── Marketplace    ├── Events
    ├── Complaints     ├── Contacts
    ├── Emergency      └── Records
    └── Campus Map
        │
        ▼
   Axios/Fetch REST Call
        │
        ▼
   Node.js / Express.js Backend
        │
        ▼
   SQL Database
        │
        ▼
   JSON Response Returned
        │
        ▼
   React Updates UI / State
        │
        ▼
   Logout (clear JWT)
        │
        ▼
   END
```

## 25. Development Order

The project should be developed in the following order:

### Phase 1 — Database
- Create SQL database
- Create `users` table
- Create `departments` table
- Create `students` table
- Create `faculty` table
- Create `complaints` table
- Create `lost_items` table
- Create `found_items` table
- Create `events` table
- Create `marketplace` table
- Create `emergency_contacts` table
- Create `dashboards` table
- Add primary and foreign keys
- Add indexes where required
- Test referential integrity

### Phase 2 — Backend Foundation (Node.js / Express.js)
- Initialize Node.js project and Express app
- Create SQL database connection module
- Set up centralized error-handling middleware
- Create authentication routes/controllers (register, login)
- Implement password hashing with bcrypt
- Implement JWT generation and verification middleware
- Implement role-based authorization middleware
- Create reusable request-validation middleware
- Create common JSON response helpers

### Phase 3 — Frontend Foundation (React.js + Tailwind CSS)
- Initialize React project and configure Tailwind CSS
- Create base Axios client with JWT interceptor
- Set up React Router and route structure
- Create Auth Context for storing user/role/token
- Create common layout (Navbar, Footer, Sidebar)
- Create login/register pages
- Create responsive dashboard shell
- Create reusable form components
- Add client-side validation

### Phase 4 — Core Modules
- Authentication (JWT)
- Dashboard
- Lost and Found
- Events
- Faculty Directory
- Marketplace
- Complaint Management
- Emergency Contacts
- Campus Map
- Admin Management

### Phase 5 — Integration
- Connect every React module to its corresponding REST API
- Connect every REST endpoint to SQL database
- Test CRUD operations end-to-end
- Test role permissions (frontend guards + backend middleware)
- Test file uploads
- Test dashboard data aggregation
- Test error handling (4xx/5xx responses in UI)
- Test concurrent database operations

### Phase 6 — Testing and Deployment
- Functional testing
- Authentication testing (JWT expiry, invalid tokens)
- Authorization testing (role checks)
- Database integrity testing
- Form validation testing (client + server)
- Security testing (CORS, injection, XSS)
- Performance testing
- Browser compatibility testing
- Deployment configuration (separate frontend/backend hosting, environment variables, HTTPS)

## 26. Final Project Flow Summary

```
SMART CAMPUS PORTAL (React SPA)
        │
        ▼
┌─────────────────┐
│ Authentication   │
│ (JWT via REST)   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ Role-Based       │
│ Authorization    │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ Personalized     │
│ React Dashboard  │
└────────┬─────────┘
         │
    ┌────┼────────────────┐
    │    │                │
    ▼    ▼                ▼
Campus Services  Information   Management
    │                │              │
    ├── Complaints   ├── Faculty    ├── Users
    ├── Lost/Found   ├── Events     ├── Complaints
    ├── Marketplace  ├── Emergency  ├── Events
    └── Campus Map   └── Campus Info└── Contacts
         │
         ▼
┌───────────────┐
│ Node.js /      │
│ Express.js     │
│ REST API       │
│ Validation     │
│ Business Logic │
│ JWT Authz      │
└───────┬────────┘
        │
        ▼
┌───────────────┐
│ SQL Database   │
│ Central DB     │
└───────┬────────┘
        │
        ▼
JSON Data Returned to React UI
```

## 27. Source Alignment

This project flow is derived from the supplied Smart Campus Portal SRS, Version 1.1. The SRS defines the system as a centralized web-based portal with role-based access and the listed campus services, and specifies the database entities and major relationships used in this flow.

**Technology stack update:** the original flow specified a PHP backend with server-rendered pages and PHP sessions. This version updates the implementation stack to React.js + Tailwind CSS on the frontend and Node.js + Express.js exposing REST APIs on the backend, with JWT-based stateless authentication in place of PHP sessions and bcrypt in place of PHP's password hashing functions. The database entities, relationships, and business rules from the SRS are unchanged — only the implementation layer differs.