const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(50) },
    title: { type: DataTypes.STRING(100) },
    message: { type: DataTypes.TEXT },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    due_date: { type: DataTypes.DATEONLY },
    related_entity_type: { type: DataTypes.STRING(50) },
    related_entity_id: { type: DataTypes.INTEGER }
}, {
    tableName: 'Notifications',
    timestamps: false
});

module.exports = Notification;
