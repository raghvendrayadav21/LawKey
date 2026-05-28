# ⚖️ LegalAdvisor

A full-stack web application that connects **clients** with **lawyers**, enabling users to browse lawyer profiles, initiate legal consultations, and manage deals — all in one platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
- [Database Models](#database-models)

---

## 📖 Overview

LegalAdvisor is a platform designed to simplify the process of finding and engaging legal professionals. Clients can register, browse a directory of lawyers filtered by specialization and location, and send deal/consultation requests. Lawyers can register their profiles and manage incoming client requests by accepting or rejecting them.

---

## ✨ Features

- 🔐 **JWT-based Authentication** — Separate registration and login flows for Clients and Lawyers
- 👨‍⚖️ **Lawyer Directory** — Browse lawyers with details like specialization, experience, location, and fees
- 📄 **Deal Management** — Clients can initiate deals; Lawyers can confirm or reject them
- 🏠 **Landing Page** — Modern homepage showcasing practice areas, about section, and mission
- 📊 **User Dashboard** — Role-aware dashboard for viewing and managing deals
- 📱 **Responsive Design** — Mobile-friendly UI with smooth animations via Framer Motion

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| React Router DOM v7 | Client-side routing |
| Framer Motion | Animations & transitions |
| Axios | HTTP client for API calls |
| Remix Icon | Icon library |
| Tailwind CSS | Utility-first styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| bcryptjs | Password hashing |
| JSON Web Tokens (JWT) | Authentication tokens |
| dotenv | Environment variable management |
| CORS | Cross-origin request handling |

---

## 📁 Project Structure

```
LegalAdvisor/
├── 01-LegalAdvisor/          # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── Cards.jsx
│   │   │   ├── Desc.jsx
│   │   │   ├── Section1.jsx
│   │   │   ├── Section2.jsx
│   │   │   └── Section3.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── RegisterClient.jsx
│   │   │   ├── RegisterLawyer.jsx
│   │   │   ├── LawyerDirectory.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── 02-LegalAdvisor-Backend/  # Node.js + Express Backend
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── models/
│   │   ├── Client.js
│   │   ├── Lawyer.js
│   │   └── Deal.js
│   ├── routes/
│   │   ├── authRoutes.js     # Registration & login endpoints
│   │   ├── lawyerRoutes.js   # Lawyer listing endpoints
│   │   └── dealRoutes.js     # Deal CRUD endpoints
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017`)
- npm (comes with Node.js)

---

### Backend Setup

```bash
# Navigate to the backend directory
cd 02-LegalAdvisor-Backend

# Install dependencies
npm install

# Create a .env file (see Environment Variables section)
# Then start the server
node server.js
```

The backend server will start on **http://localhost:5000**.

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd 01-LegalAdvisor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**.

> ⚠️ Make sure the backend server is running before starting the frontend.

---

## 🔌 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/lawyer/register` | Register a new lawyer | No |
| `POST` | `/lawyer/login` | Login as a lawyer | No |
| `POST` | `/client/register` | Register a new client | No |
| `POST` | `/client/login` | Login as a client | No |

### Lawyer Routes — `/api/lawyers`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/lawyers` | Get all lawyer listings | No |

### Deal Routes — `/api/deals`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a deal (client only) | ✅ Yes |
| `GET` | `/` | Get deals for logged-in user | ✅ Yes |
| `PUT` | `/:id` | Update deal status (lawyer only) | ✅ Yes |

---

## 🔑 Environment Variables

Create a `.env` file inside `02-LegalAdvisor-Backend/` with the following keys:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/legaladvisor
JWT_SECRET=your_strong_secret_key_here
```

> ⚠️ **Security Note:** Never commit your `.env` file to version control. Add it to `.gitignore`.

---

## 🗺️ Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, practice areas, and about section |
| `/login` | Login | Unified login page for both clients and lawyers |
| `/register-client` | RegisterClient | Registration form for clients |
| `/register-lawyer` | RegisterLawyer | Registration form for lawyers |
| `/lawyers` | LawyerDirectory | Browse and filter all registered lawyers |
| `/dashboard` | Dashboard | View and manage deals (role-aware) |

---

## 🗄️ Database Models

### Client
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, Unique |
| `username` | String | Required, Unique |
| `password` | String | Hashed with bcrypt |
| `createdAt` | Date | Auto-generated |

### Lawyer
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, Unique |
| `username` | String | Required, Unique |
| `password` | String | Hashed with bcrypt |
| `specialization` | String | Required (e.g., "Criminal Law") |
| `experience` | String | Required (e.g., "5 Years") |
| `location` | String | Required |
| `fees` | Number | Required (consultation fees) |
| `createdAt` | Date | Auto-generated |

### Deal
| Field | Type | Notes |
|-------|------|-------|
| `client_id` | ObjectId | References `Client` |
| `lawyer_id` | ObjectId | References `Lawyer` |
| `deal_status` | String | `pending` / `confirmed` / `rejected` |
| `date` | Date | Auto-generated |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

> Built with ❤️ — connecting people with the legal help they need.
