const express = require('express');
const { Category } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all predefined categories + user's custom categories
router.get('/:userId', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                [Op.or]: [
                    { type: 'predefined', deleted_at: null },
                    { user_id: req.params.userId, type: 'custom', deleted_at: null }
                ]
            },
            order: [['type', 'DESC'], ['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error('Fetch Categories Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create custom category for user
router.post('/', async (req, res) => {
    try {
        const { user_id, name, icon_name, color_hex } = req.body;
        
        if (!user_id || !name) return res.status(400).json({ error: 'Missing required fields' });

        const customCategory = await Category.create({
            user_id,
            name,
            type: 'custom',
            icon_name: icon_name || 'ellipsis-h',
            color_hex: color_hex || '#B2BABB'
        });

        res.status(201).json(customCategory);
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Soft Delete category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Not found' });

        category.deleted_at = new Date();
        await category.save();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
