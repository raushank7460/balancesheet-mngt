const mongoose = require('mongoose');
const { seedInitialData } = require('../utils/seedData');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/balancesheet');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial data
    await seedInitialData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
