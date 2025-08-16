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
// Additional Models (Admin)
// ==============================
const Subject = sequelize.define('Subject', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'subjects' });

const Quiz = sequelize.define('Quiz', {
  title: { type: DataTypes.STRING },
  subjectId: { type: DataTypes.INTEGER, allowNull: false },
  scheduledAt: { type: DataTypes.DATE }
}, { tableName: 'quizzes' });

const Attempt = sequelize.define('Attempt', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  quizId: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
}, { tableName: 'attempts' });

// Relations (optional for counts; useful for future)
Subject.hasMany(Quiz, { foreignKey: 'subjectId' });
Quiz.belongsTo(Subject, { foreignKey: 'subjectId' });
Quiz.hasMany(Attempt, { foreignKey: 'quizId' });
Attempt.belongsTo(Quiz, { foreignKey: 'quizId' });
Attempt.belongsTo(User, { foreignKey: 'userId' });

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
    const { email, password, fullName } = req.body;
    let user = await User.findByEmail(email);

    // If user doesn't exist, auto-register as a normal user
    if (!user) {
      const nameFromEmail = email?.split('@')[0]?.replace(/\W+/g, ' ') || 'New User';
      const displayName = fullName && fullName.trim() ? fullName.trim() : nameFromEmail;
      user = await User.createUser({
        email,
        password,
        fullName: displayName
      });
    }

    // Validate password for existing or newly created user
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user.toJSON();
    res.json({ success: true, message: 'Login successful', user: userData, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    const token = generateToken(user);
    const { password: _, ...userData } = user.toJSON();
    res.json({ success: true, token, user: userData });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
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

app.get('/api/admin/overview', authenticateToken, requireAdmin, async (req, res) => {
  const [users, quizzes, subjects, attempts] = await Promise.all([
    User.count(), Quiz.count(), Subject.count(), Attempt.count()
  ]);

  const subjectRows = await Subject.findAll({ raw: true });
  const bySubject = await Promise.all(subjectRows.map(async (s) => {
    const subjectQuizzes = await Quiz.findAll({ where: { subjectId: s.id }, raw: true });
    const ids = subjectQuizzes.map(q => q.id);
    const all = ids.length ? await Attempt.findAll({ where: { quizId: ids }, raw: true }) : [];
    const attemptsCount = all.length;
    const topScore = all.reduce((m, a) => Math.max(m, Math.round((a.score || 0) * 100)), 0);
    return { subject: s.name, attempts: attemptsCount || 0, topScore };
  }));

  res.json({
    stats: { users, quizzes, subjects, attempts },
    bySubject
  });
});

app.get('/api/admin/subjects', authenticateToken, requireAdmin, async (req, res) => {
  const rows = await Subject.findAll({ order: [['createdAt','DESC']] });
  res.json({ subjects: rows });
});

app.post('/api/admin/subjects', authenticateToken, requireAdmin, async (req, res) => {
  if (!req.body?.name || !req.body.name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  const s = await Subject.create({ name: req.body.name.trim() });
  res.status(201).json({ subject: s });
});

// Placeholder Quiz and Score routes to support frontend dashboard
// These can be replaced later with real Sequelize models and queries.
app.get('/api/quizzes/upcoming', authenticateToken, async (req, res) => {
  // Return an empty list for now; frontend can handle empty state
  return res.json({ success: true, quizzes: [] });
});

app.get('/api/scores/me', authenticateToken, async (req, res) => {
  // Return an empty list for now; implement real scores later
  return res.json({ success: true, scores: [] });
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    // Simple logger for now
    console.log('📊 Event:', { userId: req.user?.id, ...req.body });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ==============================
// Start Server
// ==============================
(async () => {
  await sequelize.sync({ alter: true });

  // Seed admin (sample user removed; new users can login to auto-register)
  if (!await User.findByEmail('admin@quizmaster.com')) {
    await User.createAdmin({ email: 'admin@quizmaster.com', password: 'admin123', fullName: 'Quiz Master Admin' });
    console.log('👑 Default admin created');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
