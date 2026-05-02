require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const startCron = require('./cron/recurringBillsCron');
const startDailyReminderCron = require('./cron/dailyReminderCron');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Public Routes (no JWT needed)
app.use('/api/auth', require('./routes/authRoute'));

// Protected Routes (JWT required)
app.use('/api/users',          authMiddleware, require('./routes/userRoute'));
app.use('/api/transactions',   authMiddleware, require('./routes/transactionRoute'));
app.use('/api/categories',     authMiddleware, require('./routes/categoryRoute'));
app.use('/api/budgets',        authMiddleware, require('./routes/budgetRoute'));
app.use('/api/recurring-bills',authMiddleware, require('./routes/recurringBillRoute'));
app.use('/api/analytics',      authMiddleware, require('./routes/analyticsRoute'));
app.use('/api/notifications',  authMiddleware, require('./routes/notificationRoute'));
app.use('/api/reports',        authMiddleware, require('./routes/reportRoute'));

app.get('/', (req, res) => {
    res.send('Expense Tracker API is running...');
});

// Boot the Cron Schedulers
startCron();
startDailyReminderCron();

const PORT = process.env.PORT || 5001;

// Start Server
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ Error: Port ${PORT} is already in use.`);
                console.error(`💡 Solution:`);
                console.error(`   1. Another instance of this server is likely already running.`);
                console.error(`   2. Close your other terminal windows or restart your PC.`);
                console.error(`   3. Or, change the PORT in your .env file (though you will need to update the frontend too).\n`);
                process.exit(1);
            } else {
                console.error('Server Error:', err);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
