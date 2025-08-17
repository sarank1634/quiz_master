const { sequelize, testConnection } = require('../configure/db');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test connection
    await testConnection();
    
    // Sync database (recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully.');
    
    // Create admin users (distinct roles)
    const admins = [
      {
        email: 'admin@quizmaster.com', // fixed stray spaces
        password: 'admin123',
        fullName: 'Quiz Master Admin',
        role: 'admin'
      },
      {
        email: 'superadmin@quizmaster.com',
        password: 'super123',
        fullName: 'Super Administrator',
        role: 'superadmin'
      }
    ];
    
    // Create regular users
    const users = [
      {
        email: 'user@quizmaster.com',
        password: 'user123',
        fullName: 'John Doe',
        qualification: 'Computer Science',
        dateOfBirth: '1995-01-15'
      },
      {
        email: 'student@quizmaster.com',
        password: 'student123',
        fullName: 'Jane Smith',
        qualification: 'Mathematics',
        dateOfBirth: '1998-03-22'
      },
      {
        email: 'teacher@quizmaster.com',
        password: 'teacher123',
        fullName: 'Robert Johnson',
        qualification: 'Physics',
        dateOfBirth: '1985-07-10'
      }
    ];
    
    // Seed admin users
    console.log('👑 Creating admin users...');
    for (const adminData of admins) {
      const admin = await User.createAdmin(adminData);
      console.log(`   ✅ Admin created: ${admin.email}`);
    }
    
    // Seed regular users
    console.log('👤 Creating regular users...');
    for (const userData of users) {
      const user = await User.createUser(userData);
      console.log(`   ✅ User created: ${user.email}`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('\n👑 ADMIN ACCOUNTS:');
    console.log('   Role: admin      | Email: admin@quizmaster.com      | Password: admin123');
    console.log('   Role: superadmin | Email: superadmin@quizmaster.com | Password: super123');
    console.log('\n👤 USER ACCOUNTS:');
    console.log('   Email: user@quizmaster.com       | Password: user123');
    console.log('   Email: student@quizmaster.com    | Password: student123');
    console.log('   Email: teacher@quizmaster.com    | Password: teacher123');
    console.log('\n🚨 IMPORTANT: Change default passwords in production!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run seeder
seedDatabase();
