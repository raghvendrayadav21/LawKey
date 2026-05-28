# ⚖️ LawKey — Premium Legal Consultation Platform

> A full-stack web application that bridges the gap between clients seeking legal help and lawyers offering their expertise. LawKey enables seamless lawyer discovery, deal management, AI-powered legal analysis, and real-time communication — all in one platform.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Features & Functionalities](#-features--functionalities)
- [Project Structure](#-project-structure)
- [Installation & Running the Project](#-installation--running-the-project)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)

---

## 🧾 Project Overview

**LawKey** is a modern legal tech platform designed for the Indian legal ecosystem. It allows:

- **Clients** to browse verified lawyers, hire them, chat, submit reviews, and download invoices.
- **Lawyers** to manage incoming deal requests, communicate with clients, analyze cases using AI, and track earnings via a built-in analytics dashboard.
- **Everyone** to use an AI-powered chatbot for general legal guidance and a document analyser to understand legal documents.

---

## 🛠️ Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| **Java 17** | Core programming language |
| **Spring Boot 4.0.5** | REST API framework |
| **Spring Security** | Authentication & authorization |
| **Spring Data MongoDB** | Database ORM / repository layer |
| **JWT (JJWT 0.12.5)** | Stateless token-based authentication |
| **OpenPDF (LibrePDF 1.3.30)** | PDF invoice generation |
| **Jackson Databind** | JSON serialization/deserialization |
| **Groq AI API (LLaMA 3.1)** | AI-powered legal analysis & chatbot |
| **Spring Dotenv** | `.env` file support for configuration |
| **Maven** | Build and dependency management |
| **Docker** | Containerized deployment |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI component library |
| **Vite 8** | Frontend build tool & dev server |
| **React Router DOM 7** | Client-side routing |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Icon library |
| **Mammoth.js** | `.docx` document parsing for analysis |
| **Vanilla CSS** | Custom styling with glassmorphism & animations |

### DevOps & Deployment

| Tool | Purpose |
|---|---|
| **Docker** | Backend containerization |
| **Render** | Backend cloud deployment |
| **Vercel** | Frontend cloud deployment |

---

## ✨ Features & Functionalities

### 🔐 Authentication & Authorization
- Role-based user registration (**Client** or **Lawyer**)
- Secure login with **JWT token** generation
- Protected routes enforced on both frontend and backend
- Lawyer verification via **Bar Council Number**
- Password hashing using BCrypt

### 🏛️ Landing Page
- Display of all registered and verified lawyers
- Filter lawyers by **specialization**, **location**, and **experience**
- View lawyer profiles including ratings, fees, and expertise
- Responsive, animated UI with glassmorphism design

### 👤 Client Dashboard
- Browse and hire lawyers by submitting deal proposals with description, appointment date, and amount
- View all current and past deals with real-time status tracking (`PENDING → ACCEPTED → COMPLETED / REJECTED`)
- **In-deal Chat**: Message lawyers directly on accepted deals, with support for text and file sharing (Base64)
- Submit **star ratings and reviews** for completed deals
- **Download PDF Invoices** for completed deals (branded LawKey invoice)
- View real-time **notifications** (deal updates via notification bell)
- **AI Legal Chatbot**: Ask general legal questions powered by Groq LLaMA 3.1
- **Document Analyser**: Upload `.docx` or `.txt` legal files and receive an AI-generated analysis (summary, key clauses, risks, recommendations)

### 👨‍⚖️ Lawyer Dashboard
- View and manage all incoming deal requests (accept / reject / mark as complete)
- In-deal chat with clients on accepted deals
- **AI Case Predictor**: Enter a crime description to get predicted IPC sections, applicable Indian Acts, and potential punishments using Groq AI, cross-referenced with historical case records from the database
- **Analytics Dashboard**: Visual charts showing:
  - Total, pending, accepted, completed, rejected deals
  - Total earnings from completed deals
  - Monthly earnings (last 6 months)
  - Win rate percentage
  - Average rating and total reviews
- Real-time notification system

### 🤖 AI Features (Powered by Groq LLaMA 3.1)
- **Legal Chatbot** — Always-visible floating chatbot for general legal Q&A
- **Case Prediction** (Lawyers only) — AI predicts IPC sections and punishments from a case description, with matching historical records from MongoDB
- **Document Analyser** — AI reads and analyses uploaded legal documents, returning structured summaries

### 🔔 Notification System
- Notifications are generated automatically on deal events:
  - Deal proposed (notifies lawyer)
  - Deal accepted / rejected / completed (notifies client)
- Unread count badge shown on notification bell
- Mark individual or all notifications as read

### 📄 PDF Invoice Generation
- Professionally styled PDF invoices generated server-side using OpenPDF
- Includes client & lawyer details, service description, amount, and deal reference
- Available to download by both the client and lawyer of a completed deal

---

## 📁 Project Structure

```
JAVA-LEGAL-PLATFORM/
│
├── backend/                        # Spring Boot REST API
│   ├── src/
│   │   └── main/
│   │       ├── java/com/legal/platform/backend/
│   │       │   ├── config/         # Security & CORS configuration
│   │       │   ├── controller/     # REST controllers
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── DealController.java
│   │       │   │   ├── AnalysisController.java
│   │       │   │   ├── AnalyticsController.java
│   │       │   │   ├── ChatController.java
│   │       │   │   ├── MessagingController.java
│   │       │   │   ├── NotificationController.java
│   │       │   │   ├── ClientController.java
│   │       │   │   └── LawyerController.java
│   │       │   ├── model/          # MongoDB document models
│   │       │   │   ├── Lawyer.java
│   │       │   │   ├── Client.java
│   │       │   │   ├── Deal.java
│   │       │   │   ├── DealStatus.java
│   │       │   │   ├── Message.java
│   │       │   │   ├── Notification.java
│   │       │   │   └── CaseRecord.java
│   │       │   ├── repository/     # Spring Data MongoDB repositories
│   │       │   ├── security/       # JWT filter, UserDetails, JwtUtils
│   │       │   ├── service/        # NotificationService
│   │       │   ├── payload/        # Request/Response DTOs
│   │       │   └── listener/       # Application event listeners
│   │       └── resources/
│   │           └── application.properties
│   ├── .env                        # Local environment variables
│   ├── Dockerfile                  # Docker image definition
│   └── pom.xml                     # Maven dependencies
│
└── frontend/                       # React + Vite SPA
    ├── src/
    │   ├── api/                    # Axios API call functions
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ChatBot.jsx
    │   │   ├── ChatModal.jsx
    │   │   ├── DocumentAnalyser.jsx
    │   │   └── NotificationBell.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state (JWT, user role)
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── ClientDashboard.jsx
    │   │   └── LawyerDashboard.jsx
    │   ├── App.jsx                 # Routes & protected route logic
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── vercel.json                 # Vercel SPA routing config
```

---

## 🚀 Installation & Running the Project

### Prerequisites

Make sure the following are installed on your system:

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** and **npm** — [Download](https://nodejs.org/)
- **MongoDB Atlas account** (or local MongoDB) — [MongoDB](https://www.mongodb.com/atlas)
- **Groq API Key** — [Get one free](https://console.groq.com/)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/raghvendrayadav21/LawKey.git
cd LawKey
```

---

### Step 2 — Configure the Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

3. Open `src/main/resources/application.properties` and update the MongoDB URI if you are using a local or different MongoDB instance:

```properties
spring.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lawkey?retryWrites=true&w=majority
```

> **Note:** The default URI already points to the project's MongoDB Atlas cluster. You can use it as-is for testing, or replace it with your own.

---

### Step 3 — Run the Backend

```bash
# From the backend/ directory
./mvnw spring-boot:run
```

On **Windows**, use:

```cmd
mvnw.cmd spring-boot:run
```

The backend server will start at: **`http://localhost:8080`**

---

### Step 4 — Configure & Run the Frontend

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at: **`http://localhost:5173`**

---

### Step 5 — (Optional) Run with Docker

To build and run the backend using Docker:

```bash
cd backend
docker build -t lawkey-backend .
docker run -p 8080:8080 \
  -e GROQ_API_KEY=your_groq_api_key \
  -e MONGO_URI=your_mongodb_uri \
  lawkey-backend
```

---

### Step 6 — Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |

**Register as a Client or Lawyer** from the Sign Up page to get started.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | API key for Groq AI (LLaMA model) | ✅ Yes |
| `MONGO_URI` | MongoDB connection string | ❌ No (defaults to Atlas URI in properties) |
| `PORT` | Server port (used by Render in production) | ❌ No (defaults to `8080`) |

### Backend (`application.properties`)

| Property | Description |
|---|---|
| `jwt.secret` | Secret key for signing JWT tokens |
| `jwt.expiration` | JWT validity in milliseconds (default: 24h) |
| `openai.model` | Groq model to use (default: `llama-3.1-8b-instant`) |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register as client or lawyer | ❌ |
| `POST` | `/api/auth/signin` | Login and receive JWT | ❌ |
| `GET` | `/api/lawyers` | Get all lawyers | ❌ |
| `POST` | `/api/deals/hire/{lawyerId}` | Propose a deal | ✅ CLIENT |
| `GET` | `/api/deals/client` | Get client's deals | ✅ CLIENT |
| `GET` | `/api/deals/lawyer` | Get lawyer's deals | ✅ LAWYER |
| `PUT` | `/api/deals/{id}/status` | Update deal status | ✅ LAWYER |
| `POST` | `/api/deals/{id}/review` | Submit a review | ✅ CLIENT |
| `GET` | `/api/deals/{id}/invoice` | Download PDF invoice | ✅ |
| `POST` | `/api/messages/{dealId}/send` | Send a chat message | ✅ |
| `GET` | `/api/messages/{dealId}` | Get deal messages | ✅ |
| `GET` | `/api/notifications` | Get user notifications | ✅ |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read | ✅ |
| `PUT` | `/api/notifications/read-all` | Mark all as read | ✅ |
| `POST` | `/api/chat` | AI chatbot response | ✅ |
| `POST` | `/api/analysis/predict` | AI case prediction | ✅ LAWYER |
| `POST` | `/api/analysis/document` | AI document analysis | ✅ |
| `GET` | `/api/analytics/lawyer` | Lawyer analytics data | ✅ LAWYER |

---

## 👨‍💻 Author

**Raghvendra Yadav**
GitHub: [@raghvendrayadav21](https://github.com/raghvendrayadav21)

---

*LawKey — Making legal help accessible to everyone.*
