# SnapLink 🔗 

SnapLink is a premium, production-ready, full-stack URL shortener application featuring a state-of-the-art dark-themed glassmorphism interface, real-time advanced visitor analytics, secure JWT authentication, customized alias keys, dynamic QR code provisioning, and scheduled link expiry support.

# 🔗 Live Demo

https://snaplink-url-shortener-1.onrender.com


# ✨ Key Features

- 🔐 Secure JWT Authentication
- 🔗 Advanced URL Shortening
- 📊 Real-time Analytics Dashboard
- 🎨 Modern Glassmorphism UI
- 📱 Responsive Design
- 🧾 QR Code Generation
- ⏳ Link Expiration Support
- ✏️ Custom Alias URLs
- 🗑️ Delete & Manage Links
- 🔍 Search and Filter Links
- 📈 Click Tracking Analytics

---

# 🛠️ Tech Stack

| Layer | Technologies |
|------|--------------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT |
| Charts | Recharts |
| Deployment | Render |

---

# 📁 Folder Structure

```bash
url-shortener/
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── utils/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── context/
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Tushita06/snaplink-url-shortener.git
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Run backend server:

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🚀 Deployed Links

### Frontend

https://snaplink-url-shortener-1.onrender.com

### Backend API

https://snaplink-backend-6fum.onrender.com/health

---

# 📊 Features Implemented

- User Signup/Login
- Protected Dashboard
- URL Shortening
- Custom Alias Support
- QR Code Generator
- Analytics Dashboard
- Click Statistics
- Search & Filter
- Delete Links
- Expired Link Handling
- Responsive UI

---

# 🔐 Authentication

JWT token-based authentication is used for securing protected routes.

Passwords are hashed using bcrypt before storing in MongoDB.

---

# 📈 Analytics

The analytics system tracks:

- Total Clicks
- Browser Usage
- Device Type
- Daily Clicks
- Country Tracking

---

# 🧠 Assumptions Made

- MongoDB Atlas is used for database hosting.
- Render free tier may take time to wake up.
- JWT authentication is sufficient for this project scope.
- Analytics are processed asynchronously.

---

# 🚀 Future Improvements

- Custom Domains
- Team Collaboration
- AI-based Alias Suggestions
- Advanced Export Reports
- Dark/Light Theme Toggle
- Real-time location tracking for analytics

---
---

# 🧩 Application Architecture

SnapLink follows a client-server architecture.

Frontend handles:
- Authentication UI
- Dashboard rendering
- URL management
- Analytics visualization
- QR generation

Backend handles:
- JWT authentication
- URL shortening logic
- Redirect handling
- Analytics tracking
- Database operations

MongoDB stores:
- Users
- Short URLs
- Analytics data

---

# 🧠 AI Planning Process

The application was planned with the following workflow:

1. Requirement analysis from problem statement
2. Authentication system design
3. URL shortening engine planning
4. Database schema planning
5. Analytics system architecture
6. Frontend UI/UX wireframing
7. API route structuring
8. Deployment workflow planning

AI-assisted tools were used for:
- UI inspiration
- Architecture optimization
- Documentation generation
- Component structuring

---

# 🎥 Project Demonstration Video

Demo Video Link:

https://youtu.be/JB7QCUW3iw8?si=YPwKcn4A2TThRpSN

The video demonstrates:
- User authentication
- URL shortening
- QR generation
- Analytics dashboard
- Search and filtering
- Link management
- Responsive design

---

# 📌 Hackathon Submission

This project is a part of a hackathon run by https://katomaran.com

---


