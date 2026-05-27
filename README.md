# SnapLink 🔗 

SnapLink is a premium, production-ready, full-stack URL shortener application featuring a state-of-the-art dark-themed glassmorphism interface, real-time advanced visitor analytics, secure JWT authentication, customized alias keys, dynamic QR code provisioning, and scheduled link expiry support.

---

## ⚡ Key Features

* **Advanced Analytics Engine:** Track geolocation country counts, operating systems (OS), web browsers, and device types (Mobile/Desktop/Tablet) in real-time.
* **Celebratory UI Delights:** Celebrate successful link shortcuts with animated confetti visual indicators and custom animated toast notices.
* **Robust Redirection Controls:** Configures custom aliases and optional expiry schedules. Expired URLs gracefully redirect visitors to a beautiful themed expired interface instead of returning raw backend errors.
* **Instant Client-Side QR Codes:** Instantly render high-definition vector QR codes for short links with custom color indicators and direct high-resolution PNG download hooks.
* **Production-Grade Architecture:** Features Express API rate-limiters, password crypt hashing with `bcryptjs`, state-based secure token managers, and automated MongoDB connection lifecycles.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Key Packages / Modules |
| :--- | :--- | :--- |
| **Frontend Client** | React 19 + Vite | Tailwind CSS v3, Recharts, Framer-motion, Lucide Icons, Canvas-confetti |
| **Backend Core** | Node.js + Express | Mongoose ORM, jsonwebtoken, bcryptjs, express-rate-limit, ua-parser-js |
| **Database Server** | MongoDB | Local Database or Atlas Cloud instances |

---

## 📂 System Architecture & Folder Layout

SnapLink follows clean architectural principles and isolates concerns between the API engine and the SPA browser clients:

```
d:\url-shortner\
├── backend/
│   ├── src/
│   │   ├── config/          # Database configurations & connection loops
│   │   ├── controllers/     # MVC controller logic (Auth, Urls, Analytics, Redirects)
│   │   ├── middlewares/     # Auth checks, API rate limiters, global error catches
│   │   ├── models/          # Mongoose Schemas (User, Url, Analytics)
│   │   ├── routes/          # Express REST endpoint map definitions
│   │   └── utils/           # Helper scripts (Base62 generators, URL validations)
│   ├── .env.example         # System environment configurations documentation
│   ├── package.json         # Node server packages
│   └── src/index.js         # Backend Core Entry point
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable client assets (Table, Analytics drawer, QrModal)
    │   ├── context/         # Auth status and global toast notification layer
    │   ├── pages/           # Landing sandboxes, Dashboards, Auth screens, Expiry warnings
    │   ├── utils/           # REST client wrappers & standardized fetch modules
    │   ├── App.css          # Blank styling placeholder
    │   ├── index.css        # Global CSS, radial backgrounds, scrollbars, and glass rules
    │   ├── App.jsx          # Route handlers & main application router
    │   └── main.jsx         # SPA mount point with routers and context
    ├── tailwind.config.js   # Custom dark themes, core violet colors, Outfit fonts
    ├── postcss.config.js    # PostCSS styling loaders
    └── package.json         # Vite browser application configurations
```

---

## 🚀 Setup & Installation Instructions

Follow these steps to deploy and run SnapLink locally:

### 📦 Prerequisites

* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local server running on `mongodb://127.0.0.1:27017/snaplink` or Atlas Cloud credentials)

---

### 1️⃣ Spin up the Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependency packages:
   ```bash
   npm install
   ```
3. Establish your environment variables. A default `.env` is already configured for immediate developer setups. For production, copy `.env.example` to `.env` and fill in custom details:
   ```bash
   cp .env.example .env
   ```
4. Fire up the developer server (with Nodemon hot-reload support):
   ```bash
   npm run dev
   ```
   *The core server will boot on:* `http://localhost:5000`

---

### 2️⃣ Initialize the Frontend Client

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependency packages:
   ```bash
   npm install
   ```
3. Trigger the hot-reloading development server:
   ```bash
   npm run dev
   ```
   *The React client will launch on:* `http://localhost:5173`

---

## 📡 Core API Specifications

All endpoints return standardized JSON structures. Headers must include `Authorization: Bearer <JWT_TOKEN>` for protected resources.

### 🔐 Authentication API (`/api/auth`)

* **`POST /signup`** (Public) - Create a new user profile.
  * *Request Body:* `{ "name": "John Doe", "email": "john@doe.com", "password": "securepassword" }`
* **`POST /login`** (Public) - Verify credentials and return active JWT.
  * *Request Body:* `{ "email": "john@doe.com", "password": "securepassword" }`
* **`GET /me`** (Private) - Get active profile session.

---

### 🔗 URL Management API (`/api/urls`)

* **`POST /`** (Private) - Shorten a new destination path.
  * *Request Body:* `{ "originalUrl": "https://google.com", "customAlias": "search", "expiresAt": "2026-12-31" }`
* **`GET /`** (Private) - Retrieve user links list with search/filter hooks.
  * *Query params:* `?search=google&filter=active`
* **`PUT /:id`** (Private) - Update active target destination URL or expiration date.
  * *Request Body:* `{ "originalUrl": "https://bing.com", "expiresAt": null }`
* **`DELETE /:id`** (Private) - Deletes URL and associated analytics click history.

---

### 📊 Analytics API (`/api/analytics`)

* **`GET /dashboard`** (Private) - Get aggregated totals, daily click timelines, top devices, browsers, country graphs, and last 10 visits list.
* **`GET /url/:urlId`** (Private) - Get granular clicks feed, breakdowns, and timelines for a single url shortcut.

---

### 🌐 Redirection Wildcard Endpoint (`/:shortCode`)

* **`GET /:shortCode`** (Public) - Redirects code matching dynamic links to original destinations.
  * Employs **302 Temporary Rederirection** protocol to bypass local browser caches, forcing every click event through the backend logger.
  * Captures browser, operating system (OS), device configurations, and geolocations asynchronously in the background before routing.
