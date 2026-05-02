const express = require('express');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 1. GET /api/reports/:userId/category-breakdown
//    Category-wise expense totals for the logged-in user
// ─────────────────────────────────────────────────────────────
router.get('/:userId/category-breakdown', async (req, res) => {
    try {
        const expenses = await sequelize.query(`
            SELECT 
                COALESCE(c.name, 'Uncategorized') AS category,
                c.color_hex                        AS color,
                SUM(t.amount)                      AS total,
                COUNT(t.id)                        AS txn_count
            FROM Transactions t
            LEFT JOIN Categories c ON t.category_id = c.id
            WHERE t.user_id = :userId
              AND t.transaction_type = 'expense'
              AND t.deleted_at IS NULL
              AND (c.transaction_type != 'income' OR c.transaction_type IS NULL)
            GROUP BY COALESCE(c.name, 'Uncategorized'), c.color_hex
            ORDER BY total DESC
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        const incomes = await sequelize.query(`
            SELECT 
                COALESCE(c.name, 'Uncategorized') AS category,
                c.color_hex                        AS color,
                SUM(t.amount)                      AS total,
                COUNT(t.id)                        AS txn_count
            FROM Transactions t
            LEFT JOIN Categories c ON t.category_id = c.id
            WHERE t.user_id = :userId
              AND t.transaction_type = 'income'
              AND t.deleted_at IS NULL
            GROUP BY COALESCE(c.name, 'Uncategorized'), c.color_hex
            ORDER BY total DESC
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        res.json({ expenses, incomes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────
// 2. GET /api/reports/:userId/vs-student-type
//    Compare user's category spending vs peers of same student_type
//    (hosteller vs hosteller average, day_scholar vs day_scholar average)
// ─────────────────────────────────────────────────────────────
router.get('/:userId/vs-student-type', async (req, res) => {
    try {
        // Get current user's type
        const [user] = await sequelize.query(
            `SELECT id, name, student_type, semester, hostel_name FROM Users WHERE id = :userId`,
            { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        // User's own category totals
        const mySpending = await sequelize.query(`
            SELECT 
                COALESCE(c.name, 'Uncategorized') AS category,
                SUM(t.amount)                      AS my_total
            FROM Transactions t
            LEFT JOIN Categories c ON t.category_id = c.id
            WHERE t.user_id = :userId
              AND t.transaction_type = 'expense'
              AND t.deleted_at IS NULL
            GROUP BY COALESCE(c.name, 'Uncategorized')
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        // Average spending per category among peers (same student_type, excluding current user)
        const peerSpending = await sequelize.query(`
            SELECT 
                COALESCE(c.name, 'Uncategorized')    AS category,
                AVG(sub.cat_total)                   AS peer_avg
            FROM (
                SELECT 
                    t.user_id,
                    COALESCE(c2.name, 'Uncategorized') AS cat_name,
                    SUM(t.amount)                       AS cat_total
                FROM Transactions t
                LEFT JOIN Categories c2 ON t.category_id = c2.id
                JOIN Users u ON t.user_id = u.id
                WHERE u.student_type = :studentType
                  AND t.user_id != :userId
                  AND t.transaction_type = 'expense'
                  AND t.deleted_at IS NULL
                GROUP BY t.user_id, COALESCE(c2.name, 'Uncategorized')
            ) AS sub
            LEFT JOIN Categories c ON sub.cat_name = c.name
            GROUP BY sub.cat_name
        `, {
            replacements: { studentType: user.student_type, userId: req.params.userId },
            type: QueryTypes.SELECT
        });

        // Peer count
        const [{ peer_count }] = await sequelize.query(`
            SELECT COUNT(*) AS peer_count FROM Users 
            WHERE student_type = :studentType AND id != :userId
        `, { replacements: { studentType: user.student_type, userId: req.params.userId }, type: QueryTypes.SELECT });

        res.json({
            user: { id: user.id, name: user.name, student_type: user.student_type },
            peer_count: Number(peer_count),
            my_spending: mySpending,
            peer_avg: peerSpending
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────
// 3. GET /api/reports/:userId/vs-semester
//    Compare user's total spending vs peers in the same semester
// ─────────────────────────────────────────────────────────────
router.get('/:userId/vs-semester', async (req, res) => {
    try {
        const [user] = await sequelize.query(
            `SELECT id, name, semester FROM Users WHERE id = :userId`,
            { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        // My total expense this month
        const [myStats] = await sequelize.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN transaction_type='expense' THEN amount END), 0) AS my_expense,
                COALESCE(SUM(CASE WHEN transaction_type='income'  THEN amount END), 0) AS my_income
            FROM Transactions
            WHERE user_id = :userId
              AND deleted_at IS NULL
              AND MONTH(date) = MONTH(CURDATE())
              AND YEAR(date)  = YEAR(CURDATE())
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        // Avg expense per peer in same semester
        const semesterStats = await sequelize.query(`
            SELECT 
                u.id,
                u.name,
                u.student_type,
                COALESCE(SUM(CASE WHEN t.transaction_type='expense' THEN t.amount END), 0) AS total_expense,
                COALESCE(SUM(CASE WHEN t.transaction_type='income'  THEN t.amount END), 0) AS total_income
            FROM Users u
            LEFT JOIN Transactions t 
                ON u.id = t.user_id 
               AND t.deleted_at IS NULL
               AND MONTH(t.date) = MONTH(CURDATE())
               AND YEAR(t.date)  = YEAR(CURDATE())
            WHERE u.semester = :semester
            GROUP BY u.id, u.name, u.student_type
        `, { replacements: { semester: user.semester }, type: QueryTypes.SELECT });

        // Category breakdown comparison for same semester
        const semCategoryAvg = await sequelize.query(`
            SELECT 
                COALESCE(c.name, 'Uncategorized') AS category,
                AVG(sub.cat_total)                AS sem_avg
            FROM (
                SELECT 
                    t.user_id,
                    COALESCE(c2.name, 'Uncategorized') AS cat_name,
                    SUM(t.amount)                       AS cat_total
                FROM Transactions t
                LEFT JOIN Categories c2 ON t.category_id = c2.id
                JOIN Users u ON t.user_id = u.id
                WHERE u.semester = :semester
                  AND t.user_id != :userId
                  AND t.transaction_type = 'expense'
                  AND t.deleted_at IS NULL
                GROUP BY t.user_id, COALESCE(c2.name, 'Uncategorized')
            ) AS sub
            LEFT JOIN Categories c ON sub.cat_name = c.name
            GROUP BY sub.cat_name
        `, {
            replacements: { semester: user.semester, userId: req.params.userId },
            type: QueryTypes.SELECT
        });

        res.json({
            user: { id: user.id, name: user.name, semester: user.semester },
            my_stats: myStats,
            semester_peers: semesterStats,
            sem_category_avg: semCategoryAvg
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────
// 4. GET /api/reports/:userId/vs-hostel
//    For hostellerss only: compare spending across NRS / MH / LH
// ─────────────────────────────────────────────────────────────
router.get('/:userId/vs-hostel', async (req, res) => {
    try {
        const [user] = await sequelize.query(
            `SELECT id, name, student_type, hostel_name FROM Users WHERE id = :userId`,
            { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.student_type !== 'hosteller') {
            return res.json({ not_applicable: true, message: 'Hostel comparison only applies to hosteliers.' });
        }

        // Average expense per hostel
        const hostelStats = await sequelize.query(`
            SELECT 
                u.hostel_name,
                COUNT(DISTINCT u.id)                                          AS student_count,
                AVG(sub.total_expense)                                        AS avg_expense,
                MAX(sub.total_expense)                                        AS max_expense,
                MIN(sub.total_expense)                                        AS min_expense
            FROM Users u
            JOIN (
                SELECT 
                    t.user_id,
                    SUM(t.amount) AS total_expense
                FROM Transactions t
                WHERE t.transaction_type = 'expense'
                  AND t.deleted_at IS NULL
                GROUP BY t.user_id
            ) AS sub ON u.id = sub.user_id
            WHERE u.student_type = 'hosteller'
              AND u.hostel_name IS NOT NULL
            GROUP BY u.hostel_name
            ORDER BY avg_expense DESC
        `, { type: QueryTypes.SELECT });

        // Category breakdown per hostel
        const hostelCategoryBreakdown = await sequelize.query(`
            SELECT 
                u.hostel_name,
                COALESCE(c.name, 'Uncategorized') AS category,
                AVG(sub.cat_total)                AS avg_category_spend
            FROM (
                SELECT 
                    t.user_id,
                    COALESCE(c2.name, 'Uncategorized') AS cat_name,
                    SUM(t.amount)                       AS cat_total
                FROM Transactions t
                LEFT JOIN Categories c2 ON t.category_id = c2.id
                WHERE t.transaction_type = 'expense'
                  AND t.deleted_at IS NULL
                GROUP BY t.user_id, COALESCE(c2.name, 'Uncategorized')
            ) AS sub
            JOIN Users u ON sub.user_id = u.id
            LEFT JOIN Categories c ON sub.cat_name = c.name
            WHERE u.student_type = 'hosteller'
              AND u.hostel_name IS NOT NULL
            GROUP BY u.hostel_name, sub.cat_name
            ORDER BY u.hostel_name, avg_category_spend DESC
        `, { type: QueryTypes.SELECT });

        res.json({
            user: { id: user.id, name: user.name, hostel_name: user.hostel_name },
            hostel_stats: hostelStats,
            hostel_category_breakdown: hostelCategoryBreakdown
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────
// Legacy: GET /api/reports/:userId  (audit log with deleted entries)
// ─────────────────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
    const { Transaction, Category } = require('../models');
    try {
        const transactions = await Transaction.findAll({
            where: { user_id: req.params.userId },
            include: [{ model: Category, as: 'category' }],
            order: [['date', 'DESC'], ['id', 'DESC']]
        });
        res.json(transactions);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────
// 5. GET /api/reports/:userId/time-summary
//    Weekly (last 12 weeks) and Monthly (last 6 months) expense/income totals
// ─────────────────────────────────────────────────────────────
router.get('/:userId/time-summary', async (req, res) => {
    try {
        const weekly = await sequelize.query(`
            SELECT
                YEAR(date)                      AS year,
                WEEK(date, 1)                   AS week,
                MIN(date)                       AS week_start,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS expense,
                SUM(CASE WHEN transaction_type = 'income'  THEN amount ELSE 0 END) AS income
            FROM Transactions
            WHERE user_id  = :userId
              AND deleted_at IS NULL
              AND date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
            GROUP BY YEAR(date), WEEK(date, 1)
            ORDER BY year ASC, week ASC
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        const monthly = await sequelize.query(`
            SELECT
                YEAR(date)                      AS year,
                MONTH(date)                     AS month,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS expense,
                SUM(CASE WHEN transaction_type = 'income'  THEN amount ELSE 0 END) AS income
            FROM Transactions
            WHERE user_id  = :userId
              AND deleted_at IS NULL
              AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(date), MONTH(date)
            ORDER BY year ASC, month ASC
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        // Month name helper
        const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthlyFormatted = monthly.map(r => ({
            label: `${MONTHS[Number(r.month) - 1]} ${r.year}`,
            expense: Number(r.expense),
            income: Number(r.income),
            net: Number(r.income) - Number(r.expense)
        }));

        const weeklyFormatted = weekly.map(r => ({
            label: `W${r.week} (${new Date(r.week_start).toLocaleDateString('en-IN', { day:'2-digit', month: 'short' })})`,
            expense: Number(r.expense),
            income: Number(r.income),
            net: Number(r.income) - Number(r.expense)
        }));

        res.json({ weekly: weeklyFormatted, monthly: monthlyFormatted });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────
// 6. GET /api/reports/:userId/balance-trend
//    Daily running balance (income - expense) over all transactions
// ─────────────────────────────────────────────────────────────
router.get('/:userId/balance-trend', async (req, res) => {
    try {
        const daily = await sequelize.query(`
            SELECT
                date,
                SUM(CASE WHEN transaction_type = 'income'  THEN  amount ELSE 0 END) AS day_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN  amount ELSE 0 END) AS day_expense
            FROM Transactions
            WHERE user_id  = :userId
              AND deleted_at IS NULL
            GROUP BY date
            ORDER BY date ASC
        `, { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT });

        // Compute running balance
        let runningBalance = 0;
        const trend = daily.map(d => {
            runningBalance += Number(d.day_income) - Number(d.day_expense);
            return {
                date: d.date,
                label: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                balance: parseFloat(runningBalance.toFixed(2)),
                income: Number(d.day_income),
                expense: Number(d.day_expense)
            };
        });

        res.json(trend);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
