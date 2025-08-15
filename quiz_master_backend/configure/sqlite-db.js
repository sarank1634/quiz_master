const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Create SQLite database path
const dbPath = path.join(__dirname, '..', 'database', 'quiz_master.sqlite');

// Create Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to SQLite database:', error);
    return false;
  }
};

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    // Create database directory if it doesn't exist
    const fs = require('fs');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Register models before sync
    require('../models/UserSQLite');
    require('../models/LoginActivity');

    // Sync all models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};
