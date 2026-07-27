# 🎓 Student Performance Analysis & Management System

> **Tailored Specifically for Intermediate Colleges (Junior Colleges / Class 11 & 12 / Pre-University)**

A full-stack, role-based academic performance tracking and prediction platform designed to streamline intermediate college administration, empower teachers with actionable student insights, and help students maximize their performance ahead of competitive and board examinations.

---

## 📌 Intermediate College Perspective & Focus

Intermediate education (Class 11 & 12 / Pre-University) is a pivotal juncture where student academic consistency directly impacts board results and competitive entrance exam readiness. This system was explicitly architected to address the unique workflow requirements of intermediate institutions:

* **Board & Exam Preparedness**: Enables continuous tracking across mid-terms, unit tests, and terminal examinations.
* **Early Warning Performance Prediction**: Uses attendance rates, study hours, and historical scores to calculate predicted grades and flag at-risk students before final board exams.
* **Subject & Faculty Coordination**: Simplifies how junior college lecturers upload study materials/notes, manage subject attendance, and enter subject-wise marks.
* **Student Accountability**: Gives intermediate students a personalized portal to view their class schedules, grade analytics, subject notes, and attendance percentage in real-time.

---

## ✨ Key Features

### 👨‍💼 1. Admin Portal
* **System Oversight**: Overall dashboard with metrics on total enrolled students, faculty members, and active programs.
* **Role & Permissions Control**: Manage user credentials and access rights for Admins, Teachers, and Students.
* **Automated Data Syncing & Seeding**: Easily seed default administrator accounts (`seed_admin.py`) and sync student records.

### 👩‍🏫 2. Teacher / Lecturer Portal
* **Marks & Grade Upload**: Bulk upload subject marks and assessments.
* **Attendance Management**: Log daily lecture attendance and view class attendance statistics.
* **Study Material Distribution**: Upload and organize subject notes and resource links for students.
* **Student Tracking & Insights**: Monitor individual and class performance trends over time.
* **Timetable Management**: View and coordinate daily lecture schedules.

### 👨‍🎓 3. Student Portal
* **Performance Analytics Dashboard**: Visual breakdown of scores, progress trends, and subject performance using interactive charts.
* **Grade Predictor**: View estimated grade outputs based on attendance, study habits, and historical test performance.
* **Study Notes Repository**: Access lecture notes and study resources uploaded by intermediate faculty.
* **Attendance & Results Tracker**: Track attendance percentages and view test results instantaneously.
* **Timetable View**: Stay organized with daily class schedules.

### 🤖 4. AI Student Support
* Integrated AI Chatbot (`GeminiChatBot` / `AIChatBox`) to assist students with academic queries and guidance.

---

## 📊 Demo Data & Seed Files

To facilitate testing and evaluation, a dedicated **`demo data`** folder is included in the project repository with realistic intermediate college sample data:

| File Name | Description | Stream / Scope |
| :--- | :--- | :--- |
| `demo data/MOCK_DATA.csv` | 300+ Student records including names, emails, roll numbers, age, phone numbers, and addresses. | Class 11 & 12 (**MPC** and **BiPC** streams) |
| `demo data/MOCK_DATA Teachers.csv` | Faculty member profiles with department assignments, subjects, contact info, and sections. | Mathematics, Physics, Chemistry, Biology, English |
| `demo data/teachers timetable.csv` | Weekly timetable grid mapping daily lecture periods to classes, labs, and practice sessions. | Intermediate Class A & B schedules |

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework**: React 19 + Vite + TypeScript
* **Routing**: Wouter
* **Styling**: Tailwind CSS v4 + Radix UI Primitives + Lucide React Icons
* **Data Visualization**: Recharts
* **Form Handling**: React Hook Form + Zod validation

### **Backend**
* **Framework**: Python Flask (v3.0.3)
* **Database**: MongoDB (via PyMongo 4.8)
* **Authentication**: JWT (PyJWT) with bcrypt password hashing
* **CORS**: Flask-CORS

---

## 📂 Project Architecture

```
myproject/
├── demo data/                  # Sample CSV Datasets for Testing
│   ├── MOCK_DATA.csv          # Student mock dataset (Class 11 & 12, MPC/BiPC)
│   ├── MOCK_DATA Teachers.csv # Faculty mock dataset
│   └── teachers timetable.csv # Lecture timetable mock matrix
│
├── client/                     # React 19 Frontend Application
│   ├── src/
│   │   ├── components/        # Layouts, Navigation, Dialogs, AI Chatbot, UI Components
│   │   ├── contexts/          # Auth and Theme Contexts
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── lib/               # API utilities and helper functions
│   │   └── pages/             # Admin, Teacher, and Student Page Views
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Flask Backend API
│   ├── routes/                # Auth, Admin, Students, Attendance, Notes, Predict, Timetable
│   ├── utils/                 # Auth middleware & admin initializers
│   ├── app.py                 # Flask entry point
│   ├── config.py              # Environment configuration & MongoDB setup
│   ├── database.py            # PyMongo database connection
│   ├── models.py              # Data access models
│   ├── seed_admin.py          # Admin seeding script
│   └── requirements.txt       # Python dependencies
│
└── .gitignore                  # Git ignore rules for sensitive & build files
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+)
* **MongoDB** (Local instance or MongoDB Atlas cluster)

---

### 1. Backend Setup (`server/`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up your environment variables (`.env` in `server/` directory):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/squash_db
   JWT_SECRET=your_jwt_secret_key
   ADMIN_EMAIL=admin@college.com
   ADMIN_PASSWORD=admin@123
   ```

5. (Optional) Seed the initial Admin user:
   ```bash
   python seed_admin.py
   ```

6. Start the Flask Backend server:
   ```bash
   python app.py
   ```
   *Backend will run on `http://localhost:5000`*

---

### 2. Frontend Setup (`client/`)

1. Navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`*

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.