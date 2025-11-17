// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI not set in environment variables');
      throw new Error('MONGO_URI missing');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    // Throw error so Lambda logs it
    throw error;
  }
};

module.exports = connectDB;
