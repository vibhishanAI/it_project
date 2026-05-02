# Student Expense Tracker

A comprehensive web-based expense tracker designed for students to manage their finances, track income and expenses, and gain insights into their spending habits.

## 🚀 Features

- **User Management**: Secure registration and login with JWT. Validated profiles (Course, Semester, Registration Number).
- **Transaction Tracking**: Log income and expenses with real-time input validation (Alphabets only for names/courses, 10 digits for phones).
- **Budgeting**: Set weekly and monthly budgets with automatic filtering of expense categories.
- **Analytics & Reports**: Visual summaries of spending patterns using interactive charts.
- **Recurring Bills**: Manage recurring payments like mess dues and semester fees with Auto-Pay options.
- **Notifications**: Stay updated with budget alerts and bill reminders.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vanilla CSS, Recharts, Lucide React.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL with Sequelize ORM.
- **Authentication**: JWT (JSON Web Token) & Bcrypt password hashing.

---

## 🚦 Setup Instructions (Running on a new PC)

If you are moving this project to another computer, follow these steps exactly to get it running:

### 1. Prerequisites
Ensure the new computer has these installed:
- **Node.js** (v16 or higher)
- **MySQL Server** (Ensure it is running)

### 2. Database Setup
The data is stored in MySQL, which lives outside the project folder. You must recreate it on the new machine:
1. Open **MySQL Workbench** or your terminal.
2. Create the database:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
3. Open the project root folder and locate `schema_ddl.sql` and `seed_dml.sql`.
4. Import these files into your new `expense_tracker` database to create the tables and default categories.

### 3. Backend Configuration (`.env`)
The backend needs to know how to talk to *your* specific MySQL installation.
1. Navigate to the `backend` folder.
2. Look for a file named `.env`. If it doesn't exist, create it.
3. Update the fields to match the new PC's MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_mysql_password_here
   DB_NAME=expense_tracker
   JWT_SECRET=supersecret123
   PORT=5001
   ```
   > **Note**: Change `DB_PASS` to whatever password you set during your MySQL installation.

### 4. Install & Run
Open **two** separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm start
```

---

## 🏗️ Project Structure

```text
.
├── backend/            # Node.js/Express API
├── frontend/           # React/TypeScript UI
├── schema_ddl.sql      # Database Tables Setup
├── seed_dml.sql        # Default Categories & Sample Data
└── screenshots/        # Project Preview Images
```

## 📄 License
This project is licensed under the MIT License.
