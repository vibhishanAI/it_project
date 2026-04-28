const express = require('express');
const { Budget, Category } = require('../models');

const router = express.Router();

// Get budgets for a user
router.get('/:userId', async (req, res) => {
    try {
        const budgets = await Budget.findAll({
            where: { user_id: req.params.userId, deleted_at: null },
            include: [{ model: Category, as: 'category' }],
            order: [['end_date', 'DESC']]
        });
        res.json(budgets);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Create limit
router.post('/', async (req, res) => {
    try {
        const bdg = await Budget.create(req.body);
        res.status(201).json(bdg);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Soft Delete limit
router.delete('/:id', async (req, res) => {
    try {
        const b = await Budget.findByPk(req.params.id);
        if (!b) return res.status(404).json({error: 'Not found'});
        b.deleted_at = new Date();
        await b.save();
        res.json({ message: 'Deleted' });
    } catch(e) {
        res.status(500).json({error:'Error'});
    }
});

module.exports = router;
