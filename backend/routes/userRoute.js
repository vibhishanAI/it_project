const express = require('express');
const { User } = require('../models');
const router = express.Router();

router.put('/:id', async (req, res) => {
    try {
        const { name, course, student_type, hostel_name, semester, phone_number, scholarship_amount, profile_image } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.update({
            name,
            course,
            student_type,
            hostel_name: student_type === 'hosteller' ? hostel_name : null,
            semester: semester || null,
            phone_number,
            scholarship_amount: scholarship_amount || 0,
            profile_image: profile_image || null
        });

        // send back updated user without password hash
        const { password_hash, ...safeUser } = user.toJSON();
        res.json(safeUser);
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
