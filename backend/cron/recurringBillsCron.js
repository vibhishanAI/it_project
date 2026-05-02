const cron = require('node-cron');
const { RecurringBill, Transaction, Notification } = require('../models');
const { Op } = require('sequelize');

function startCron() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('CRON: Running daily Recurring Bills checks...');
        const todayDate = new Date();
        const today = todayDate.toISOString().split('T')[0];
        
        // Date 3 days from now for reminders
        const threeDaysLaterDate = new Date();
        threeDaysLaterDate.setDate(threeDaysLaterDate.getDate() + 3);
        const threeDaysLater = threeDaysLaterDate.toISOString().split('T')[0];

        try {
            // 1. Process AUTO-POST bills that are due today or earlier
            const dueBills = await RecurringBill.findAll({
                where: {
                    is_active: true,
                    is_auto_post: true,
                    due_date: { [Op.lte]: today },
                    deleted_at: null
                }
            });

            for (let bill of dueBills) {
                await Transaction.create({
                    user_id: bill.user_id,
                    category_id: bill.category_id,
                    amount: bill.amount,
                    transaction_type: 'expense',
                    source_or_description: bill.title + ' (Auto-Generated)',
                    date: today,
                    payment_method: 'Auto-Debit'
                });

                await Notification.create({
                    user_id: bill.user_id,
                    type: 'system_message',
                    title: 'Auto-Bill Paid',
                    message: `Automatically posted ₹${bill.amount} for ${bill.title} directly into your expenses.`,
                    related_entity_type: 'RecurringBill',
                    related_entity_id: bill.id
                });

                const currentDueDate = new Date(bill.due_date);
                if (bill.frequency === 'daily') currentDueDate.setDate(currentDueDate.getDate() + 1);
                else if (bill.frequency === 'weekly') currentDueDate.setDate(currentDueDate.getDate() + 7);
                else if (bill.frequency === 'monthly') currentDueDate.setMonth(currentDueDate.getMonth() + 1);
                else currentDueDate.setMonth(currentDueDate.getMonth() + 1); 

                bill.due_date = currentDueDate.toISOString().split('T')[0];
                await bill.save();
            }

            // 2. Process REMINDERS for bills due in 3 days (both auto and manual)
            const upcomingBills = await RecurringBill.findAll({
                where: {
                    is_active: true,
                    due_date: threeDaysLater,
                    deleted_at: null
                }
            });

            for (let bill of upcomingBills) {
                // Avoid duplicate reminders for the same due date
                const existingRem = await Notification.findOne({
                    where: {
                        user_id: bill.user_id,
                        type: 'recurring_bill_reminder',
                        related_entity_id: bill.id,
                        message: { [Op.like]: `%due in 3 days%` }
                    }
                });

                if (!existingRem) {
                    await Notification.create({
                        user_id: bill.user_id,
                        type: 'recurring_bill_reminder',
                        title: 'Upcoming Bill',
                        message: `Reminder: Your ${bill.title} of ₹${bill.amount} is due in 3 days (${threeDaysLater}).`,
                        related_entity_type: 'RecurringBill',
                        related_entity_id: bill.id
                    });
                    console.log(`CRON: Sent upcoming bill reminder to user ${bill.user_id} for ${bill.title}`);
                }
            }

        } catch (e) {
            console.error('CRON ERROR:', e);
        }
    });
}

module.exports = startCron;
