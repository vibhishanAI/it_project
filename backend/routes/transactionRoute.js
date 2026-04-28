const express = require('express');
const { Transaction, Category, Budget, Notification } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Middleware to simulate authentication for Phase 2 test
// In a real scenario, use JWT verification middleware here (e.g., authMiddleware)
// router.use(authMiddleware);

// Get all transactions for a user
router.get('/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { user_id: req.params.userId, deleted_at: null },
            include: [{ model: Category, as: 'category' }],
            order: [['date', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        console.error('Fetch Transactions Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a transaction
router.post('/', async (req, res) => {
    try {
        const { user_id, category_id, amount, transaction_type, source_or_description, date, payment_method } = req.body;
        
        const newTx = await Transaction.create({
            user_id,
            category_id: category_id || null,
            amount,
            transaction_type,
            source_or_description,
            date,
            payment_method
        });

        // Trigger Budget Notifications
        if (transaction_type === 'expense') {
            const activeBudgets = await Budget.findAll({
                where: {
                    user_id,
                    start_date: { [Op.lte]: date },
                    end_date: { [Op.gte]: date },
                    deleted_at: null
                }
            });

            for (let budget of activeBudgets) {
                if (budget.category_id && budget.category_id != newTx.category_id) continue;

                const filters = {
                    user_id,
                    transaction_type: 'expense',
                    deleted_at: null,
                    date: { [Op.between]: [budget.start_date, budget.end_date] }
                };
                if (budget.category_id) filters.category_id = budget.category_id;

                const totalExp = await Transaction.sum('amount', { where: filters }) || 0;
                const threshold = budget.amount_limit * ((budget.alert_threshold || 80) / 100);

                if (totalExp >= threshold) {
                    await Notification.create({
                        user_id,
                        type: 'budget_alert',
                        title: 'Budget Alert',
                        message: `Budget Warning: You spent ₹${Number(totalExp).toFixed(2)}, reaching ${Math.round((totalExp/budget.amount_limit)*100)}% of your limit (₹${budget.amount_limit}).`,
                        related_entity_type: 'Budget',
                        related_entity_id: budget.id
                    });
                }
            }
        }

        res.status(201).json(newTx);
    } catch (error) {
        console.error('Create Transaction Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Edit a transaction
router.put('/:id', async (req, res) => {
    try {
        const { category_id, amount, transaction_type, source_or_description, date, payment_method } = req.body;
        
        const tx = await Transaction.findByPk(req.params.id);
        if (!tx || tx.deleted_at !== null) return res.status(404).json({ error: 'Transaction not found' });

        await tx.update({
            category_id: category_id || null,
            amount,
            transaction_type,
            source_or_description,
            date,
            payment_method
        });

        // Trigger Budget Notifications upon edit
        if (transaction_type === 'expense') {
            const activeBudgets = await Budget.findAll({
                where: {
                    user_id: tx.user_id,
                    start_date: { [Op.lte]: date },
                    end_date: { [Op.gte]: date },
                    deleted_at: null
                }
            });

            for (let budget of activeBudgets) {
                if (budget.category_id && budget.category_id != tx.category_id) continue;
                const filters = {
                    user_id: tx.user_id,
                    transaction_type: 'expense',
                    deleted_at: null,
                    date: { [Op.between]: [budget.start_date, budget.end_date] }
                };
                if (budget.category_id) filters.category_id = budget.category_id;

                const totalExp = await Transaction.sum('amount', { where: filters }) || 0;
                const threshold = budget.amount_limit * ((budget.alert_threshold || 80) / 100);

                if (totalExp >= threshold) {
                    await Notification.create({
                        user_id: tx.user_id,
                        type: 'budget_alert',
                        title: 'Budget Alert',
                        message: `Budget Warning: After your edit, you have spent ₹${Number(totalExp).toFixed(2)}, reaching ${Math.round((totalExp/budget.amount_limit)*100)}% of your limit (₹${budget.amount_limit}).`,
                        related_entity_type: 'Budget',
                        related_entity_id: budget.id
                    });
                }
            }
        }

        res.json(tx);
    } catch (error) {
        console.error('Update Transaction Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete (Soft Delete) a transaction
router.delete('/:id', async (req, res) => {
    try {
        const tx = await Transaction.findByPk(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Not found' });

        tx.deleted_at = new Date();
        await tx.save();

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete Transaction Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
