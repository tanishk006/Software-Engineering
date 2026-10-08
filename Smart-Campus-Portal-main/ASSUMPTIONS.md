# Smart Campus Portal — Architectural Assumptions

This document records the specific design decisions made where the Software Requirements Specification (SRS) was silent, ambiguous, or deferred implementation details.

---

### 1. Authentication and Token Handling
- **JWT Storage:** The JWT access token is stored in the browser's `localStorage` and optionally in response headers for stateless REST API requests via the `Authorization: Bearer <token>` header.
- **Session Duration:** Access tokens expire after 24 hours (`24h`), matching typical academic portal working shifts without forcing frequent re-logins during class sessions.
- **Google OAuth Flow:** The Google OAuth token (ID token) received by `@react-oauth/google` is sent to the backend `POST /api/auth/google` endpoint. The server verifies the token signature against Google's public keys using `google-auth-library` and validates the user's email domain against `ALLOWED_EMAIL_DOMAINS`.
- **OAuth Callback Route:** In addition to popup token verification, a backend OAuth callback route (`GET /api/auth/google/callback`) is provided for redirect-based OAuth flows. If the account domain is not whitelisted, the user is redirected to `/login?error=Unauthorized domain. Only institutional accounts are allowed.`
- **Default Role for New Users:** When a user logs in via Google for the first time, a user record is automatically provisioned with the `Student` role. Administrative privilege escalation (to `Faculty`, `Staff`, or `Admin`) is performed exclusively by an existing `Admin` from the Admin Panel.

### 2. Domain Whitelisting
- **Configuration:** Allowed institutional domains are specified in the `.env` variable `ALLOWED_EMAIL_DOMAINS` as a comma-separated list (e.g. `college.edu,campus.edu,gmail.com`).
- **Validation:** Checked strictly on the server during Google token verification and local account registration. If the domain does not match any allowed entry, the request is rejected with HTTP 403 Forbidden.

### 3. Role Hierarchy and Access Permissions
- **Admin:** Has full access to user management (role updates, account deactivation), complaints moderation & assignment, events management, emergency contacts, faculty directory, and campus map locations.
- **Faculty:** Can view dashboard, browse/search faculty directory, create and manage department events, and view emergency contacts.
- **Student:** Can access student dashboard, submit and track complaints with optional file attachments, create and manage their own lost & found listings, create and browse marketplace items, register for events, search faculty directory, view emergency contacts, and browse the campus map.
- **Staff (Non-Faculty):** Can access staff dashboard, view and update status of assigned complaints, view events, and view directory/emergency resources.

### 4. File Uploads
- **Storage Location:** Uploaded assets (lost & found photos, marketplace listings, complaint proof attachments) are stored locally on the server filesystem under `/server/uploads` in dedicated subdirectories (`/uploads/lost-found`, `/uploads/marketplace`, `/uploads/complaints`).
- **Path Storage:** Relative file paths (e.g. `/uploads/marketplace/photo-1712345678.jpg`) are saved in the database and served statically through Express at `http://localhost:5000/uploads/...`.
- **Limits:** Multer enforces a 5MB per-file maximum size and restricts accepted MIME types to `image/jpeg`, `image/png`, `image/webp`, and `application/pdf` (for complaint attachments).

### 5. Complaint Status Workflow & History
- **Statuses:** `Open` -> `In Progress` -> `Resolved` (or `Rejected`).
- **Audit History:** When an Admin or Staff changes the status of a complaint or enters remarks, a record is inserted into `complaint_history` capturing `old_status`, `new_status`, `remarks`, and `changed_by`. Students can inspect this timeline directly on their complaint detail view.

### 6. Campus Map
- **Technology:** Leaflet.js with OpenStreetMap cartography.
- **Coordinates:** Centered around representative collegiate campus coordinates (Latitude `12.9716`, Longitude `77.5946`) with points of interest mapped across academic blocks, student residences, cafeterias, sports complexes, and emergency facilities.

### 7. Marketplace Policies
- **Listing Scope:** Peer-to-peer student marketplace for textbooks, drafting equipment, electronics, cycles, and hostel supplies.
- **Transactions:** Financial transactions occur peer-to-peer off-platform; prices are listed in Indian Rupees (₹ INR).
- **Listing Lifecycle:** Sellers or Admins can mark listings as `Sold` or toggle them back to `Available`. Sellers can edit or delete their own listings; Admins have moderation privileges.

### 8. Emergency Contacts Direct Access
- **Quick-Dial Routing:** Direct telephone `tel:` and email `mailto:` integration across modern mobile and desktop browsers for immediate crisis response.
- **Classification:** Categorized into Security, Medical, Fire, Helpline, and Administrative breakdown services with 24x7 indicators.
