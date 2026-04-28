# Expense Tracker Website Requirements

## 1. Project Overview

This project is a web-based Expense Tracker designed primarily for students to record income and expenses, manage budgets, categorize transactions, and view reports. The system will help users understand their spending habits, maintain a budget, and receive reminders or alerts related to expenses.

## 2. Functional Requirements

### 2.1 User Management

The system shall provide user account features including:

- Student registration and login
- Profile setup with `hosteller` or `day scholar` selection and specific `hostel_name`
- Semester selection
- Scholarship input
- Edit profile

### 2.2 Transaction Management (Unified)

The system shall allow users to:

- Add, edit, and "soft delete" transactions (Income or Expense)
- Categorize each transaction
- View unified transaction history (Chronological feed)

### 2.3 Categorization

The system shall provide:

- Predefined categories with visual icons and colors
- Option to add custom categories
- Option to remove categories where allowed

### 2.4 Budget Control

The system shall allow users to:

- Set weekly budget
- Set monthly budget
- Set optional category-specific budget limits
- Receive alerts when approaching limits

### 2.5 Sorting and Filtering

The system shall allow users to:

- Sort transactions by amount
- Sort transactions by date
- Filter transactions by date range
- Filter transactions by category

### 2.6 Reports and Analysis

The system shall provide:

- Weekly expense summary
- Monthly expense summary
- Charts and graphs (Spending by Category, Balance Trend)
- Total balance calculation
- Export reports to PDF
- Export reports to Excel
- **UoH Insights:** Comparative analysis based on `student_type`, `semester`, and `hostel_name`

### 2.7 Notifications

The system shall provide:

- Reminder to add daily expenses
- Budget limit alerts
- Recurring bill reminders (e.g., mess dues, semester fees)


## 3. Technical Requirements

### 3.1 Frontend Technologies

- Library: React
- Language: TypeScript
- Styling: CSS
- State management:
  - React Hooks (`useState`, `useEffect`)
  - Optional: Context API or Redux
- HTTP client:
  - Fetch API or Axios

### 3.2 Backend Technologies

- Runtime: Node.js
- Framework: Express.js
- API type: RESTful API
- Authentication: JWT (JSON Web Token)

### 3.3 Database Technologies

- Database: MySQL
- ORM: Sequelize
- Additional tooling (optional): Prisma for migration or schema management

## 4. Data Requirements

The original slide provides a starting point, but to support the functional requirements properly, the data model should include a few additional fields.

### 4.1 User Data

Required user data:

- `id` (PK)
- `name`
- `registration_number` (Unique)
- `email` (Unique)
- `password_hash`
- `course`
- `student_type` (`hosteller` or `day_scholar`)
- `hostel_name` (e.g., NRS, MH, LH - Optional for day scholars)
- `semester`
- `scholarship_amount` (optional)
- `profile_image` (optional)
- `phone_number` (optional)
- `is_active`

Notes:

- Password should never be stored as plain text; only a hashed version should be saved.
- Email should be unique.
- Registration number should also be unique for student users.
- `student_type`, `semester`, and scholarship-related fields are needed to support the updated profile setup requirements.

### 4.2 Transaction Data

Required income data:

Required transaction data:

- `id` (PK)
- `user_id` (FK)
- `category_id` (FK, nullable for pure income sources)
- `amount`
- `transaction_type` (`income` or `expense`)
- `source_or_description`
- `date`
- `payment_method` (optional)
- `created_at`
- `updated_at`
- `deleted_at` (Timestamp for Soft Deletes)


Example income sources:

- Parental allowance
- Scholarship
- Internship
- Part-time job
- Freelance work
- Other

### 4.3 Category Data

Required category data:

- `id` (PK)
- `user_id` (FK, nullable for system-defined categories)
- `name`
- `type` (`predefined` or `custom`)
- `icon_name` (e.g., 'coffee', 'bus')
- `color_hex` (e.g., '#FF5733')
- `deleted_at`

Suggested predefined categories:

- Mess food
- Travel
- Rent
- Laundry
- Shopping
- Events
- Dining out
- Utilities
- Study materials
- Health
- Other

Notes:

- Predefined categories can be available to all users.
- Custom categories can be created per user.

### 4.4 Budget Data

Required budget data:

- `id` (PK)
- `user_id` (FK)
- `category_id` (FK, optional for overall budget limit)
- `period_type` (`weekly` or `monthly`)
- `amount_limit`
- `start_date`
- `end_date`
- `alert_threshold` (e.g., 80 or 90 percent)
- `deleted_at`


Notes:

- A user may have one active weekly budget and one active monthly budget.
- Budget data is necessary to support budget limit alerts.

### 4.5 Notification Data

Required notification-related data:

- `id` (PK)
- `user_id` (FK)
- `type`
- `title`
- `message`
- `is_read`
- `due_date` (optional)
- `related_entity_type` (e.g., 'Budget', 'RecurringBill' - optional)
- `related_entity_id` (optional)

Example notification types:

- Daily expense reminder
- Budget warning
- Budget exceeded
- Recurring bill reminder

Notes:

- Notifications may be stored in the database even if delivery is initially only in-app.

### 4.6 Report Data

Reports may be generated dynamically from income, expense, category, and budget data. A separate report table is not strictly required for the first version, but if report exports are saved, the following can be added:

- `id` (PK)
- `user_id` (FK)
- `report_type`
- `from_date`
- `to_date`
- `file_path`
- `created_at`

For the updated scope, report generation should also support institution-specific comparisons or insights, such as spending patterns based on student type, semester, or common UoH-related expense heads.

### 4.7 Recurring Bill Data

To support reminders for mess dues and semester fees, a recurring bill or scheduled payment table is recommended.

Required recurring bill data:

- `id` (PK)
- `user_id` (FK)
- `category_id` (FK)
- `title`
- `amount`
- `frequency`
- `due_date`
- `is_active`
- `is_auto_post` (Boolean: If true, system automatically creates a Transaction on the due date)
- `created_at`
- `updated_at`
- `deleted_at`

Example recurring bills:

- Mess dues
- Semester fees
- Hostel fees
- Transport pass

Notes:

- This table is helpful for reminder notifications and for future planned-expense forecasting.
- If you want a simpler first version, recurring bills can initially be stored as notification schedules instead of a separate full module.


## 5. Initial Project Structure

Based on the sample structure shown in the screenshot, the backend can start with a structure like this:

```text
expense-tracker/
├─ backend/
│  ├─ routes/
│  │  ├─ authRoutes.js
│  │  ├─ incomeRoutes.js
│  │  ├─ expenseRoutes.js
│  │  ├─ categoryRoutes.js
│  │  ├─ budgetRoutes.js
│  │  └─ reportRoutes.js
│  ├─ models/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ config/
│  ├─ .env
│  ├─ package.json
│  └─ server.js
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ hooks/
│  │  ├─ context/
│  │  └─ App.tsx
│  └─ package.json
└─ requirements.md
```

## 7. Assumptions and Scope Notes

- This document reflects the current project scope based on the provided slides and screenshots.
- Data requirements have been adjusted to support the listed features in a practical implementation.
- Because the latest scope is student-specific, user profile data now includes hosteller/day scholar selection, semester, and scholarship-related information.
- Notifications, report export, recurring bill reminders, and advanced comparisons may be implemented in phases.
- The first version can focus on authentication, profile setup, income, expense, categories, budgets, and basic reports before adding advanced reminders and institution-specific analytics.
