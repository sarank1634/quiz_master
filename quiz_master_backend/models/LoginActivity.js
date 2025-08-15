const { DataTypes } = require('sequelize');
const { sequelize } = require('../configure/sqlite-db');

const LoginActivity = sequelize.define('LoginActivity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  action: {
    type: DataTypes.ENUM('login', 'logout'),
    allowNull: false,
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'user_agent',
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'login_activity',
  timestamps: true,
  underscored: true,
});

module.exports = LoginActivity;
