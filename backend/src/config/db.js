const mongoose = require('mongoose');
const { config } = require('./env');

let isConnected = false;

async function connectDB() {
  if (!config.mongoUri) {
    console.warn('⚠️ MONGODB_URI is not set. Database is currently DISCONNECTED.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully to: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1 || isConnected;
}

module.exports = {
  connectDB,
  isDbConnected,
};
