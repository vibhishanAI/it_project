const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    type: { type: DataTypes.ENUM('predefined', 'custom'), allowNull: false },
    transaction_type: { type: DataTypes.ENUM('income', 'expense', 'both'), defaultValue: 'expense' },
    icon_name: { type: DataTypes.STRING(50) },
    color_hex: { type: DataTypes.STRING(7) },
    deleted_at: { type: DataTypes.DATE }
}, {
    tableName: 'Categories',
    timestamps: false
});

module.exports = Category;
