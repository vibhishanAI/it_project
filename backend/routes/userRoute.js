const express = require('express');
const { User } = require('../models');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Fetch User Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, course, student_type, hostel_name, semester, phone_number, scholarship_amount, profile_image_base64 } = req.body;
        let { profile_image } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (profile_image_base64) {
            // Remove header if present (e.g. data:image/jpeg;base64,)
            const base64Data = profile_image_base64.replace(/^data:image\/\w+;base64,/, "");
            const filename = `profile-${user.id}-${Date.now()}.jpg`;
            const filepath = path.join(__dirname, '../public/uploads', filename);
            fs.writeFileSync(filepath, base64Data, 'base64');
            profile_image = `http://localhost:5001/uploads/${filename}`;
        }

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
