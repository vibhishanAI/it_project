const express = require('express');
const { RecurringBill, Category } = require('../models');

const router = express.Router();

// Get bills
router.get('/:userId', async (req, res) => {
    try {
        const bills = await RecurringBill.findAll({
            where: { user_id: req.params.userId, deleted_at: null },
            include: [{ model: Category, as: 'category' }],
        });
        res.json(bills);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Create bill
router.post('/', async (req, res) => {
    try {
        const bill = await RecurringBill.create(req.body);
        res.status(201).json(bill);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Toggle active status
router.put('/:id/toggle', async (req, res) => {
    try {
        const bill = await RecurringBill.findByPk(req.params.id);
        if (!bill) return res.status(404).json({ error: 'Not found' });
        bill.is_active = !bill.is_active;
        await bill.save();
        res.json(bill);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Soft Delete bill
router.delete('/:id', async (req, res) => {
    try {
        const bill = await RecurringBill.findByPk(req.params.id);
        if (!bill) return res.status(404).json({ error: 'Not found' });
        bill.deleted_at = new Date();
        await bill.save();
        res.json({ message: 'Recurring bill deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
