const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    registration_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    course: { type: DataTypes.STRING(100) },
    student_type: { type: DataTypes.ENUM('hosteller', 'day_scholar'), allowNull: false },
    hostel_name: { type: DataTypes.STRING(100) },
    semester: { type: DataTypes.INTEGER },
    scholarship_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    profile_image: { type: DataTypes.STRING(255) },
    phone_number: { type: DataTypes.STRING(20) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'Users',
    timestamps: false
});

module.exports = User;
