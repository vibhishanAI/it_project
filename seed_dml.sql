-- ==========================================
-- FILE: seed.dml
-- PURPOSE: Insert sample data and defaults
-- ==========================================

-- Seed 10 Users
INSERT INTO Users (name, registration_number, email, password_hash, course, student_type, hostel_name, semester) VALUES
('Rahul Sharma', 'UOH23001', 'rahul@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'CS', 'hosteller', 'NRS', 3),
('Priya Das', 'UOH23002', 'priya@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'Math', 'day_scholar', NULL, 3),
('Ankit Verma', 'UOH23003', 'ankit@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'Physics', 'hosteller', 'MH', 5),
('Sneha Reddy', 'UOH23004', 'sneha@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'CS', 'hosteller', 'LH', 1),
('Vikram Singh', 'UOH23005', 'vikram@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'Economics', 'day_scholar', NULL, 4),
('Megha Iyer', 'UOH23006', 'megha@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'Biology', 'hosteller', 'NRS', 2),
('Arjun Nair', 'UOH23007', 'arjun@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'CS', 'hosteller', 'MH', 3),
('Kriti Pal', 'UOH23008', 'kriti@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'Philosophy', 'day_scholar', NULL, 6),
('Siddharth J.', 'UOH23009', 'sid@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'Chemistry', 'hosteller', 'LH', 4),
('Ayesha Khan', 'UOH23010', 'ayesha@uoh.edu', '$2b$10$gF7L99AuQb4aiacQWSV2X.RR7gaN3rF4Dt0uDrL70Iokynebk2bEe', 'CS', 'hosteller', 'NRS', 2);

-- Seed 11 Predefined Categories
INSERT INTO Categories (user_id, name, type, icon_name, color_hex) VALUES
(NULL, 'Mess food', 'predefined', 'utensils', '#FF5733'),
(NULL, 'Travel', 'predefined', 'bus', '#33FF57'),
(NULL, 'Rent', 'predefined', 'home', '#3357FF'),
(NULL, 'Laundry', 'predefined', 'tshirt', '#F333FF'),
(NULL, 'Shopping', 'predefined', 'shopping-cart', '#FFFF33'),
(NULL, 'Events', 'predefined', 'calendar', '#33FFFF'),
(NULL, 'Dining out', 'predefined', 'hamburger', '#FF8C33'),
(NULL, 'Utilities', 'predefined', 'bolt', '#33FFBD'),
(NULL, 'Study materials', 'predefined', 'book', '#7D33FF'),
(NULL, 'Health', 'predefined', 'heartbeat', '#FF3385'),
(NULL, 'Other', 'predefined', 'ellipsis-h', '#B2BABB');

-- Seed 10 Transactions (Income & Expenses)
INSERT INTO Transactions (user_id, category_id, amount, transaction_type, source_or_description, date) VALUES
(1, NULL, 5000.00, 'income', 'Parental allowance', '2026-04-01'),
(1, 1, 2500.00, 'expense', 'Mess dues payment', '2026-04-05'),
(2, NULL, 15000.00, 'income', 'Scholarship', '2026-04-01'),
(3, NULL, 3000.00, 'income', 'Internship stipend', '2026-04-10'),
(4, 2, 500.00, 'expense', 'Auto to Gachibowli', '2026-04-12'),
(5, 9, 1200.00, 'expense', 'Reference books', '2026-04-15'),
(6, NULL, 2000.00, 'income', 'Freelance design work', '2026-04-16'),
(7, 7, 450.00, 'expense', 'Dinner at DLF', '2026-04-18'),
(8, 10, 300.00, 'expense', 'Pharmacy medicine', '2026-04-18'),
(9, NULL, 1000.00, 'income', 'Part-time job', '2026-04-19');

-- Seed 10 Budgets
INSERT INTO Budgets (user_id, category_id, period_type, amount_limit, start_date, end_date) VALUES
(1, 1, 'monthly', 3000.00, '2026-04-01', '2026-04-30'),
(2, 2, 'weekly', 500.00, '2026-04-19', '2026-04-25'),
(3, 9, 'monthly', 1000.00, '2026-04-01', '2026-04-30'),
(4, 1, 'monthly', 2800.00, '2026-04-01', '2026-04-30'),
(5, NULL, 'monthly', 10000.00, '2026-04-01', '2026-04-30'),
(6, 4, 'weekly', 200.00, '2026-04-19', '2026-04-25'),
(7, 7, 'weekly', 1000.00, '2026-04-19', '2026-04-25'),
(8, 10, 'monthly', 500.00, '2026-04-01', '2026-04-30'),
(9, 2, 'monthly', 2000.00, '2026-04-01', '2026-04-30'),
(10, 1, 'monthly', 3000.00, '2026-04-01', '2026-04-30');

-- Seed 10 Recurring Bills
INSERT INTO Recurring_Bills (user_id, category_id, title, amount, frequency, due_date, is_auto_post) VALUES
(1, 1, 'Mess dues', 2500.00, 'monthly', '2026-05-01', TRUE),
(3, 3, 'Hostel fees', 12000.00, '6 months', '2026-06-15', FALSE),
(2, 2, 'Transport pass', 500.00, 'monthly', '2026-05-01', TRUE),
(4, 1, 'Mess dues', 2800.00, 'monthly', '2026-05-01', TRUE),
(5, 8, 'Electricity bill', 400.00, 'monthly', '2026-04-25', FALSE),
(6, 1, 'Mess dues', 2500.00, 'monthly', '2026-05-01', TRUE),
(7, 3, 'Semester fees', 15000.00, '6 months', '2026-07-01', FALSE),
(8, 2, 'Daily bus pass', 50.00, 'daily', '2026-04-20', TRUE),
(9, 1, 'Mess dues', 2600.00, 'monthly', '2026-05-01', TRUE),
(10, 1, 'Mess dues', 2500.00, 'monthly', '2026-05-01', TRUE);

-- Seed 10 Notifications
INSERT INTO Notifications (user_id, type, title, message) VALUES
(1, 'Daily expense reminder', 'Log Expenses', 'Do not forget to log your coffee expense!'),
(2, 'Budget warning', 'Transport Budget', 'You have used 85% of your travel budget.'),
(3, 'Recurring bill reminder', 'Hostel Fees', 'Hostel fee due in 5 days.'),
(4, 'Budget exceeded', 'Food Limit', 'You have exceeded your food budget by ₹200.'),
(5, 'Daily expense reminder', 'Stay Updated', 'Keeping track helps you save for your goals!'),
(6, 'Budget warning', 'Laundry Budget', 'Laundry budget almost finished.'),
(7, 'Recurring bill reminder', 'Mess Fees', 'Pay mess dues by the 5th.'),
(8, 'Daily expense reminder', 'New Day', 'Start your day by logging yesterday''s dinner.'),
(9, 'Budget warning', 'Study Materials', '75% of book budget used.'),
(10, 'Daily expense reminder', 'Quick Tip', 'Add snacks to the "Other" category.');

-- Seed 10 Reports
INSERT INTO Reports (user_id, report_type, from_date, to_date, file_path) VALUES
(1, 'Monthly Summary', '2026-03-01', '2026-03-31', '/exports/mar_report_1.pdf'),
(2, 'Weekly Insights', '2026-04-01', '2026-04-07', '/exports/week1_2.pdf'),
(3, 'Semester Outlook', '2026-01-01', '2026-06-30', '/exports/sem_report_3.xlsx'),
(4, 'Monthly Summary', '2026-03-01', '2026-03-31', '/exports/mar_report_4.pdf'),
(5, 'Weekly Insights', '2026-04-08', '2026-04-14', '/exports/week2_5.pdf'),
(6, 'Monthly Summary', '2026-03-01', '2026-03-31', '/exports/mar_report_6.pdf'),
(7, 'Weekly Insights', '2026-04-01', '2026-04-07', '/exports/week1_7.pdf'),
(8, 'Monthly Summary', '2026-03-01', '2026-03-31', '/exports/mar_report_8.pdf'),
(9, 'Weekly Insights', '2026-04-08', '2026-04-14', '/exports/week2_9.pdf'),
(10, 'Monthly Summary', '2026-03-01', '2026-03-31', '/exports/mar_report_10.pdf');