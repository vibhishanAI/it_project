const User = require('./User');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Budget = require('./Budget');
const RecurringBill = require('./RecurringBill');
const Notification = require('./Notification');

// Define Relationships
// User <-> Categories (1:N)
User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Transactions (1:N)
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category <-> Transactions (1:N)
Category.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Add relationships for Budget and RecurringBill
User.hasMany(Budget, { foreignKey: 'user_id', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(Budget, { foreignKey: 'category_id' });
Budget.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(RecurringBill, { foreignKey: 'user_id', as: 'recurring_bills' });
RecurringBill.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(RecurringBill, { foreignKey: 'category_id' });
RecurringBill.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    User,
    Category,
    Transaction,
    Budget,
    RecurringBill,
    Notification
};
