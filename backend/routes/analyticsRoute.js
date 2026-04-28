const express = require('express');
const { Transaction, Category, User } = require('../models');

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Fetch User for context (e.g. Hosteller vs Day Scholar)
        const user = await User.findByPk(userId);
        if(!user) return res.status(404).json({error: 'User not found'});

        // Fetch user's transactions
        const transactions = await Transaction.findAll({
            where: { user_id: userId, deleted_at: null },
            include: [{ model: Category, as: 'category' }]
        });

        let totalIncome = 0;
        let totalExpense = 0;
        let messExpense = 0;
        let travelExpense = 0;
        let booksExpense = 0;

        const categoryBreakdown = {};

        transactions.forEach(tx => {
            const amt = parseFloat(tx.amount);
            if (tx.transaction_type === 'income') {
                totalIncome += amt;
            } else {
                totalExpense += amt;
                
                // Aggregate by Category
                const catName = tx.category ? tx.category.name : 'Uncategorized';
                if(!categoryBreakdown[catName]) categoryBreakdown[catName] = 0;
                categoryBreakdown[catName] += amt;

                // Special UoH Insight logic
                const catLower = catName.toLowerCase();
                if(catLower.includes('mess') || catLower.includes('food') || catLower.includes('dining')) messExpense += amt;
                if(catLower.includes('travel') || catLower.includes('transport') || catLower.includes('bus')) travelExpense += amt;
                if(catLower.includes('book') || catLower.includes('study') || catLower.includes('lab')) booksExpense += amt;
            }
        });

        const messages = [];

        // Food
        if(user.student_type === 'hosteller' && messExpense > 3500) {
            messages.push(`Your food/mess expenses (₹${messExpense.toFixed(0)}) exceed the UoH monthly average of ₹3000. Consider eating more in your hostel mess!`);
        } else if (user.student_type === 'day_scholar' && messExpense > 2000) {
            messages.push(`Your food expenses (₹${messExpense.toFixed(0)}) are slightly high for a day scholar.`);
        } else if (messExpense < 1500 && messExpense > 0) {
            messages.push(`Great job keeping food expenses low this cycle.`);
        }

        // Travel
        if (user.student_type === 'day_scholar' && travelExpense > 1500) {
            messages.push(`Your campus transit costs (₹${travelExpense.toFixed(0)}) are very high. Consider checking UoH bus pass options!`);
        }
        
        // Books and Stipend relation
        if (booksExpense > (user.scholarship_amount || 0) && (user.scholarship_amount || 0) > 0) {
            messages.push(`You spent more on Study Materials than your stipend (₹${user.scholarship_amount}). Be careful!`);
        }
        
        if (messages.length === 0) {
            messages.push("You are spending optimally compared to campus averages. Keep it up!");
        }

        res.json({
            totals: {
                income: totalIncome,
                expense: totalExpense,
                balance: totalIncome - totalExpense
            },
            categoryBreakdown,
            insights: {
                messages,
                student_type: user.student_type
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
