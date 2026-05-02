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

-- Seed Predefined Categories (Income & Expenses)
INSERT INTO Categories (user_id, name, type, transaction_type, icon_name, color_hex) VALUES
-- Income Categories (IDs 1-4)
(NULL, 'Parent Allowance', 'predefined', 'income', 'users', '#4DB6AC'),
(NULL, 'Scholarship', 'predefined', 'income', 'graduation-cap', '#8C82FC'),
(NULL, 'Salary/Freelance', 'predefined', 'income', 'briefcase', '#FFD54F'),
(NULL, 'Other Income', 'predefined', 'income', 'plus-circle', '#AED581'),
-- Expense Categories (IDs 5-15)
(NULL, 'Mess food', 'predefined', 'expense', 'utensils', '#FF5733'),
(NULL, 'Travel', 'predefined', 'expense', 'bus', '#33FF57'),
(NULL, 'Rent', 'predefined', 'expense', 'home', '#3357FF'),
(NULL, 'Laundry', 'predefined', 'expense', 'tshirt', '#F333FF'),
(NULL, 'Shopping', 'predefined', 'expense', 'shopping-cart', '#FFFF33'),
(NULL, 'Events', 'predefined', 'expense', 'calendar', '#33FFFF'),
(NULL, 'Dining out', 'predefined', 'expense', 'hamburger', '#FF8C33'),
(NULL, 'Utilities', 'predefined', 'expense', 'bolt', '#33FFBD'),
(NULL, 'Study materials', 'predefined', 'expense', 'book', '#7D33FF'),
(NULL, 'Health', 'predefined', 'expense', 'heartbeat', '#FF3385'),
(NULL, 'Other Expense', 'predefined', 'expense', 'ellipsis-h', '#B2BABB');

-- Seed Transactions
INSERT INTO Transactions (user_id, category_id, amount, transaction_type, source_or_description, date) VALUES
-- Rahul Sharma (User 1)
(1, 1, 10000.00, 'income', 'Monthly Allowance from Dad', '2026-04-01 10:00:00'),
(1, 3, 2500.00, 'income', 'Part-time Web Dev Gig', '2026-04-10 14:30:00'),
(1, 5, 2500.00, 'expense', 'Monthly Mess Dues', '2026-04-05 09:00:00'),
(1, 6, 150.00, 'expense', 'Auto to University Library', '2026-04-06 11:15:00'),
(1, 11, 450.00, 'expense', 'Pizza Night with Friends', '2026-04-12 20:00:00'),
(1, 13, 1200.00, 'expense', 'New Lab Coat & Books', '2026-04-15 16:45:00'),
(1, 6, 80.00, 'expense', 'Bus to City Center', '2026-04-18 10:30:00'),
(1, 11, 300.00, 'expense', 'Lunch at Canteen', '2026-04-20 13:00:00'),
(1, 9, 2000.00, 'expense', 'New Sneakers', '2026-04-22 18:20:00'),
(1, 8, 400.00, 'expense', 'Electricity Bill Share', '2026-04-25 10:00:00'),
-- Other Users
(2, 2, 15000.00, 'income', 'Merit Scholarship', '2026-04-01 09:00:00'),
(3, 4, 3000.00, 'income', 'Sold Old Textbook', '2026-04-10 12:00:00'),
(4, 6, 500.00, 'expense', 'Travel to Home', '2026-04-12 08:30:00'),
(5, 13, 1200.00, 'expense', 'Reference books', '2026-04-15 15:00:00'),
(6, 3, 2000.00, 'income', 'Freelance design work', '2026-04-16 11:00:00'),
(7, 11, 450.00, 'expense', 'Dinner at DLF', '2026-04-18 21:00:00'),
(8, 14, 300.00, 'expense', 'Pharmacy medicine', '2026-04-18 19:30:00'),
(9, 3, 1000.00, 'income', 'Part-time job', '2026-04-19 14:00:00');

-- Seed 10 Budgets
INSERT INTO Budgets (user_id, category_id, period_type, amount_limit, start_date, end_date) VALUES
(1, 5, 'monthly', 3000.00, '2026-04-01', '2026-04-30'),
(2, 2, 'weekly', 500.00, '2026-04-19', '2026-04-25'),
(3, 9, 'monthly', 1000.00, '2026-04-01', '2026-04-30'),
(4, 5, 'monthly', 2800.00, '2026-04-01', '2026-04-30'),
(5, NULL, 'monthly', 10000.00, '2026-04-01', '2026-04-30'),
(6, 4, 'weekly', 200.00, '2026-04-19', '2026-04-25'),
(7, 7, 'weekly', 1000.00, '2026-04-19', '2026-04-25'),
(8, 10, 'monthly', 500.00, '2026-04-01', '2026-04-30'),
(9, 2, 'monthly', 2000.00, '2026-04-01', '2026-04-30'),
(10, 5, 'monthly', 3000.00, '2026-04-01', '2026-04-30');

-- Seed 10 Recurring Bills
INSERT INTO Recurring_Bills (user_id, category_id, title, amount, frequency, due_date, is_auto_post) VALUES
(1, 5, 'Mess dues', 2500.00, 'monthly', '2026-05-01', TRUE),
(3, 3, 'Hostel fees', 12000.00, '6 months', '2026-06-15', FALSE),
(2, 2, 'Transport pass', 500.00, 'monthly', '2026-05-01', TRUE),
(4, 5, 'Mess dues', 2800.00, 'monthly', '2026-05-01', TRUE),
(5, 8, 'Electricity bill', 400.00, 'monthly', '2026-04-25', FALSE),
(6, 5, 'Mess dues', 2500.00, 'monthly', '2026-05-01', TRUE),
(7, 3, 'Semester fees', 15000.00, '6 months', '2026-07-01', FALSE),
(8, 2, 'Daily bus pass', 50.00, 'daily', '2026-04-20', TRUE),
(9, 5, 'Mess dues', 2600.00, 'monthly', '2026-05-01', TRUE),
(10, 5, 'Mess dues', 2500.00, 'monthly', '2026-05-01', TRUE);

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