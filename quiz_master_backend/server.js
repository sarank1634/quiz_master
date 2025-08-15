// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

// ==============================
// Database Connection
// ==============================
const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
})();

// ==============================
// Models
// ==============================
const User = sequelize.define('User', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
  qualification: DataTypes.STRING,
  dateOfBirth: DataTypes.DATE,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'users'
});

User.createAdmin = async ({ email, password, fullName }) => {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ email, password: hashed, fullName, role: 'admin' });
};

User.createUser = async ({ email, password, fullName, qualification, dateOfBirth }) => {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ email, password: hashed, fullName, qualification, dateOfBirth, role: 'user' });
};

User.findByEmail = (email) => User.findOne({ where: { email } });

// ==============================
// Auth Helpers
// ==============================
const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

// ==============================
// Express Setup
// ==============================
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-frontend-domain.com' : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ==============================
// Routes
// ==============================
app.get('/', (req, res) => res.json({ message: 'Quiz Master API is running!', status: 'healthy' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, qualification, dateOfBirth } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ success: false, message: 'Missing fields' });

    if (await User.findByEmail(email)) return res.status(400).json({ success: false, message: 'Email already registered' });

    const newUser = await User.createUser({ email, password, fullName, qualification, dateOfBirth });
    const token = generateToken(newUser);
    const { password: _, ...userData } = newUser.toJSON();
    res.status(201).json({ success: true, message: 'Registered successfully', user: userData, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    const { password: _, ...userData } = user.toJSON();
    res.json({ success: true, message: 'Login successful', user: userData, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: user.toJSON() });
});

app.get('/api/auth/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const users = await User.findAll();
  res.json({ success: true, users: users.map(u => u.toJSON()) });
});

// ==============================
// Start Server
// ==============================
(async () => {
  await sequelize.sync({ alter: true });

  // Seed admin & sample user
  if (!await User.findByEmail('admin@quizmaster.com')) {
    await User.createAdmin({ email: 'admin@quizmaster.com', password: 'admin123', fullName: 'Quiz Master Admin' });
    console.log('👑 Default admin created');
  }
  if (!await User.findByEmail('user@quizmaster.com')) {
    await User.createUser({ email: 'user@quizmaster.com', password: 'user123', fullName: 'Sample User' });
    console.log('👤 Sample user created');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
