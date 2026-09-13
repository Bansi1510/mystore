const mongoose = require('mongoose');
const dns = require('dns');
const { config } = require('./env');

// Fix DNS resolution issues on Windows for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

let isConnected = false;

async function connectDB() {
  mongoose.set('strictQuery', true);

  if (!config.mongoUri) {
    console.error('❌ MONGODB_URI is missing in .env configuration');
    isConnected = false;
    return false;
  }

  try {
    const sanitizedUri = config.mongoUri.replace(/:([^@]+)@/, ':****@');
    console.log(`📡 Connecting to Primary MONGODB_URI (${sanitizedUri})...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`✅ Primary MongoDB Atlas Connected successfully to host: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (${config.mongoUri}): ${error.message}`);
    isConnected = false;
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
