const express = require('express');
const { Notification } = require('../models');

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const notifs = await Notification.findAll({
            where: { user_id: req.params.userId },
            order: [['id', 'DESC']]
        });
        res.json(notifs);
    } catch (e) {
        res.status(500).json({ error: 'Server Error', details: e.message });
    }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByPk(req.params.id);
        if(!notif) return res.status(404).json({error: 'Not found'});
        notif.is_read = true;
        await notif.save();
        res.json(notif);
    } catch(e) {
        res.status(500).json({error:'Error'});
    }
});

module.exports = router;
