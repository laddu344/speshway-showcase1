const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

// Admin credentials - Update these as needed
const users = [
  {
    name: 'Admin User',
    email: 'admin@speshway.com',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    name: 'Super Admin',
    email: 'superadmin@speshway.com',
    password: 'SuperAdmin123!',
    role: 'admin',
  },
  {
    name: 'Administrator',
    email: 'administrator@speshway.com',
    password: 'Admin@2024',
    role: 'admin',
  },
  {
    name: 'HR Manager',
    email: 'hr@speshway.com',
    password: 'HrManager123!',
    role: 'hr',
  },
];

connectDB();    

const importData = async () => {
  try {
    await User.deleteMany();

    // Use User.create() for each user to trigger pre-save hooks for password hashing
    const createdUsers = [];
    for (const user of users) {
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
    }

    console.log('Data Imported!');
    console.log(`Admin users created: ${createdUsers.length}`);
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@speshway.com');
    console.log('Password: Admin123!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}