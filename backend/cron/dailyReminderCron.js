const cron = require('node-cron');
const { User, Transaction, Notification } = require('../models');
const { Op } = require('sequelize');

function startDailyReminderCron() {
    // Run every day at 8:00 PM
    cron.schedule('0 20 * * *', async () => {
        console.log('CRON: Running Daily Expense Reminder check...');
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const users = await User.findAll({ where: { is_active: true } });

            for (let user of users) {
                // Check if user has any transactions today
                const txCount = await Transaction.count({
                    where: {
                        user_id: user.id,
                        date: today,
                        deleted_at: null
                    }
                });

                if (txCount === 0) {
                    // Check if a reminder was already sent today to avoid spamming
                    const existingNotif = await Notification.findOne({
                        where: {
                            user_id: user.id,
                            type: 'daily_reminder',
                            created_at: {
                                [Op.gte]: new Date(today + 'T00:00:00Z')
                            }
                        }
                    });

                    if (!existingNotif) {
                        await Notification.create({
                            user_id: user.id,
                            type: 'daily_reminder',
                            title: 'Log Expenses',
                            message: "You haven't logged any expenses or income today. Keeping track helps you stay on budget!",
                        });
                        console.log(`CRON: Sent daily reminder to user ${user.id}`);
                    }
                }
            }
        } catch (e) {
            console.error('DAILY REMINDER CRON ERROR:', e);
        }
    });
}

module.exports = startDailyReminderCron;
