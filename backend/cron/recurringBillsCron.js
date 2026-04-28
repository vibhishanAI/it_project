const cron = require('node-cron');
const { RecurringBill, Transaction, Notification } = require('../models');
const { Op } = require('sequelize');

function startCron() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('CRON: Running daily auto-post check for Recurring Bills...');
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const dueBills = await RecurringBill.findAll({
                where: {
                    is_active: true,
                    is_auto_post: true,
                    due_date: { [Op.lte]: today },
                    deleted_at: null
                }
            });

            for (let bill of dueBills) {
                // 1. Post transaction
                await Transaction.create({
                    user_id: bill.user_id,
                    category_id: bill.category_id,
                    amount: bill.amount,
                    transaction_type: 'expense',
                    source_or_description: bill.title + ' (Auto-Generated)',
                    date: today,
                    payment_method: 'Auto-Debit'
                });

                // 2. Alert the user
                await Notification.create({
                    user_id: bill.user_id,
                    type: 'system_message',
                    title: 'Auto-Bill Paid',
                    message: `Automatically posted ₹${bill.amount} for ${bill.title} directly into your expenses.`,
                    related_entity_type: 'RecurringBill',
                    related_entity_id: bill.id
                });

                // 3. Roll forward the due date to the next cycle
                const currentDueDate = new Date(bill.due_date);
                if (bill.frequency === 'daily') currentDueDate.setDate(currentDueDate.getDate() + 1);
                else if (bill.frequency === 'weekly') currentDueDate.setDate(currentDueDate.getDate() + 7);
                else if (bill.frequency === 'monthly') currentDueDate.setMonth(currentDueDate.getMonth() + 1);
                else currentDueDate.setMonth(currentDueDate.getMonth() + 1); 

                bill.due_date = currentDueDate.toISOString().split('T')[0];
                await bill.save();
            }
        } catch (e) {
            console.error('CRON ERROR:', e);
        }
    });
}

module.exports = startCron;
