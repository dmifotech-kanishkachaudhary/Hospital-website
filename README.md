# 🏥 City Hospital / Dhanamitra Healthcare Management System

A modern, full-stack healthcare management platform built to streamline interactions between **Patients**, **Doctors**, and **Hospital Administrators**. The platform features real-time consultation chat, automated AI medical report analysis using Google Gemini AI, online appointment booking with Razorpay payment gateway integration, and transactional email notifications.

---

## 🌟 Key Features

### 👤 1. Patient Portal
- **User Authentication**: Secure registration and JWT-based login with encrypted passwords (`bcryptjs`).
- **Doctor Directory & Booking**: Search for doctors by specialization, view available slots, and book appointments.
- **Online Payment**: Integrated **Razorpay** payment gateway for seamless appointment fee transactions.
- **Medical Report Uploads & AI Analysis**: Upload PDF medical reports parsed automatically and analyzed by **Google Gemini AI** to extract diagnostics and summaries.
- **Real-Time Live Chat**: Instant messaging powered by **Socket.io** to chat directly with doctors.
- **Medical Records**: Access consultation history, prescribed treatments, and uploaded lab reports.

### 👨‍⚕️ 2. Doctor Portal
- **Doctor Verification & Profile**: Professional login and schedule management.
- **Appointment Management**: View upcoming appointments, track patient queues, and update consultation statuses.
- **Patient History & Records**: Review patient profiles, uploaded reports, and AI-generated summaries before consultations.
- **Real-Time Consultation Chat**: Connect live with patients through Socket.io chat rooms.

### 🛡️ 3. Admin Control Panel
- **System Dashboard**: Complete platform oversight with metrics for total appointments, active patients, verified doctors, and reports.
- **Doctor Management**: Review doctor applications, approve/reject registrations, and update specialization details.
- **Patient Database**: Monitor user registrations and access detailed patient records.
- **Appointment Oversight**: Manage and update all appointment bookings hospital-wide.
- **Security & Audit Logs**: Track login attempts and access security audit logs (`LoginAttempt` schema).

### 🤖 4. AI & Real-Time Technologies
- **Google Gemini AI Integration**: Parses uploaded PDF medical documents (`pdf-parse`) and generates easy-to-understand diagnostic summaries.
- **Socket.io WebSockets**: Enables low-latency, bidirectional real-time messaging between doctors and patients.
- **Nodemailer Integration**: Automatically dispatches confirmation and notification emails to patients and doctors.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios
- **Real-Time Socket**: Socket.io Client (`socket.io-client`)
- **Payment Gateway**: Razorpay Checkout SDK
- **Styling**: Modern CSS3 (Glassmorphism UI, Responsive layouts, Dark/Light themed accents)

### **Backend**
- **Runtime**: Node.js
- **Web Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **AI Integration**: Google Gen AI SDK (`@google/genai` / `@google/generative-ai`)
- **File Uploads & Parsing**: Multer & `pdf-parse`
- **Real-Time Engine**: Socket.io
- **Email Service**: Nodemailer
- **Payment Engine**: Razorpay Node SDK

---

## 📁 Project Structure

```text
Dhanamitra/
├── backend/
│   ├── config/             # DB & Socket configurations
│   ├── controllers/        # Express request controllers (auth, doctor, appointment, AI, chat, etc.)
│   ├── middleware/         # Auth verification & role validation middleware
│   ├── models/             # Mongoose Schemas (User, Doctor, Appointment, MedicalReport, Chat, etc.)
│   ├── routes/             # Express API routes
│   ├── sockets/            # Socket.io event handlers for live chat
│   ├── uploads/            # Temporary directory for uploaded PDF reports
│   ├── utils/              # Helper utilities (Gemini AI service, emailer, etc.)
│   ├── .env.example        # Backend environment template
│   ├── package.json        # Node dependencies & scripts
│   └── server.js           # Server entry point
│
└── frontend/
    ├── public/             # Static assets & public files
    ├── src/
    │   ├── assets/         # Images, icons, and dynamic media
    │   ├── components/     # Reusable UI components (Navbar, Footer, Modals, Cards)
    │   ├── pages/          # Application views organized by user role
    │   │   ├── admin/      # Admin Dashboard, Patients, Doctors, Appointments, Reports
    │   │   ├── doctor/     # Doctor Dashboard, Login, Register, Chat, Profile, Schedule
    │   │   ├── public/     # Public Landing Page & Healthcare Information
    │   │   └── user/       # Patient Dashboard, Book Appointment, Chat, Upload Report
    │   ├── services/       # API integration & Axios instances
    │   ├── socket.js       # Socket.io connection helper
    │   ├── App.jsx         # Main router setup
    │   └── main.jsx        # React root renderer
    ├── .env.example        # Frontend environment template
    ├── package.json        # React frontend dependencies & Vite scripts
    └── vite.config.js      # Vite build configuration
```

---

## ⚙️ Environment Variables Setup

Before running the application, create `.env` files in both the `backend` and `frontend` root directories.

### 1. `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
PAYMENT_API_KEY=your_razorpay_key_id
PAYMENT_API_SECRET=your_razorpay_key_secret
TEST_MODE=true
```

### 2. `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Installation & Local Setup

### **Prerequisites**
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas Cloud URL)

### **1. Setup Backend**
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start backend dev server with Nodemon
npm run dev
```
> The backend server will run on `http://localhost:5000`.

### **2. Setup Frontend**
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite frontend development server
npm run dev
```
> The frontend application will run on `http://localhost:5173`.

---

## 📡 API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new user/patient |
| **Auth** | `POST` | `/api/auth/login` | Login user and obtain JWT |
| **Doctors** | `GET` | `/api/doctors` | Get all verified doctors |
| **Doctors** | `GET` | `/api/doctors/:id` | Get single doctor details |
| **Appointments** | `POST` | `/api/appointments` | Book new appointment |
| **Appointments** | `GET` | `/api/appointments/user` | Get patient appointments |
| **Reports** | `POST` | `/api/reports/upload` | Upload PDF medical report |
| **AI** | `POST` | `/api/ai/analyze-report` | Analyze medical report with Gemini AI |
| **Chat** | `GET` | `/api/chat/history/:chatId` | Get message history |
| **Payment** | `POST` | `/api/payment/create-order` | Create Razorpay order |
| **Payment** | `POST` | `/api/payment/verify` | Verify Razorpay payment signature |

---

## 🔒 Security Best Practices

- **Never Commit Sensitive Keys**: `.env` files are added to `.gitignore` to prevent leaking MongoDB credentials, Razorpay secret keys, or Google Gemini API keys.
- **Role Validation**: Routes are protected using JWT authorization middleware (`authMiddleware.js`).
- **Passwords**: All user and doctor passwords are hashed with `bcryptjs` before DB insertion.


