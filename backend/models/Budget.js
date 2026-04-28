const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    period_type: { type: DataTypes.ENUM('weekly', 'monthly'), allowNull: false },
    amount_limit: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    alert_threshold: { type: DataTypes.INTEGER, defaultValue: 80 },
    deleted_at: { type: DataTypes.DATE }
}, {
    tableName: 'Budgets',
    timestamps: false
});

module.exports = Budget;
