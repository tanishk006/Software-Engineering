src/
├── app/
│   ├── App.jsx
│   └── routes/
│       ├── AppRoutes.jsx
│       └── ProtectedRoute.jsx        (fixed typo: was ProjectedRoute)
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── ForgotPassword.jsx
│   │   └── services/
│   │       └── authService.js
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── StatsCard.jsx
│   │   │   └── RecentTicket.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   └── services/
│   │       └── dashboardService.js
│   │
│   ├── complaints/                    (your existing "maintenance" module — see §3)
│   │   ├── components/
│   │   │   ├── TicketCard.jsx
│   │   │   └── TicketTable.jsx
│   │   ├── pages/
│   │   │   ├── CreateTicket.jsx
│   │   │   └── Ticket.jsx
│   │   └── services/
│   │       └── complaintService.js   (fixed typo: was assestService / maintenanceService)
│   │
│   ├── lost-and-found/                ← NOT YET BUILT (SRS 3.4)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── events/                        ← NOT YET BUILT (SRS 3.5)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── faculty-directory/             ← NOT YET BUILT (SRS 3.6)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── marketplace/                   ← NOT YET BUILT (SRS 3.7)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── emergency-contacts/            ← NOT YET BUILT (SRS 3.9)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   └── campus-map/                    ← NOT YET BUILT (SRS 3.10)
│       ├── components/
│       ├── pages/
│       └── services/
│
├── components/                        # truly cross-feature, reused everywhere
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   └── ui/
│       └── ClickSpark.jsx
│
├── layouts/
│   └── DashboardLayout.jsx
│
├── lib/
│   └── utils.js
│
├── services/
│   └── api.js                         # shared axios instance, base URL, interceptors
│
├── assets/
├── App.css
├── index.css
└── main.jsx