const mongoose = require('mongoose');
const { config } = require('./env');

let isConnected = false;
let mongod = null;

async function connectDB() {
  mongoose.set('strictQuery', true);

  // 1. Try provided MONGODB_URI (MongoDB Atlas or custom URI)
  if (config.mongoUri) {
    try {
      console.log(`📡 Connecting to Primary MONGODB_URI...`);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 4000,
        family: 4,
      });
      isConnected = true;
      console.log(`✅ Primary MongoDB Connected successfully to: ${mongoose.connection.host}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Primary MongoDB Connection Warning (${error.message}). Attempting local/dev database fallback...`);
    }
  }

  // 2. Try Local MongoDB (mongodb://127.0.0.1:27017/cloud_file_manager)
  try {
    const localUri = 'mongodb://127.0.0.1:27017/cloud_file_manager';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    isConnected = true;
    console.log(`✅ Local MongoDB Connected successfully at: ${localUri}`);
    return true;
  } catch (localError) {
    // 3. Fallback to MongoMemoryServer (In-Memory MongoDB)
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      isConnected = true;
      console.log(`✅ Dev In-Memory MongoDB Server Connected successfully at: ${memoryUri}`);
      console.log(`💡 All database operations (Folder Creation, Search, Trash, Admin) are FULLY ACTIVE!`);
      return true;
    } catch (memError) {
      console.error(`❌ Database Connection Error: ${memError.message}`);
      isConnected = false;
      return false;
    }
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1 || isConnected;
}

module.exports = {
  connectDB,
  isDbConnected,
};
