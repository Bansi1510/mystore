const path = require('path');
const dotenv = require('dotenv');

// Load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5050', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET || '',
  },
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  normalUserPassword: process.env.NORMAL_USER_PASSWORD || '',
  normalUserHash: process.env.NORMAL_USER_PASSWORD_HASH || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminHash: process.env.ADMIN_PASSWORD_HASH || '',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  totalStorageLimitGb: parseInt(process.env.TOTAL_STORAGE_LIMIT_GB || '100', 10),
};

function validateEnv() {
  const warnings = [];
  const errors = [];

  if (!config.mongoUri) {
    warnings.push('MONGODB_URI is missing. Database operations will return configuration errors.');
  }

  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    warnings.push('Cloudinary credentials (CLOUD_NAME / CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET) are missing.');
  }

  if (!config.normalUserPassword && !config.normalUserHash) {
    warnings.push('NORMAL_USER_PASSWORD or NORMAL_USER_PASSWORD_HASH is missing in .env.');
  }

  if (!config.adminPassword && !config.adminHash) {
    warnings.push('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH is missing in .env.');
  }

  if (!config.jwtSecret) {
    warnings.push('JWT_SECRET is missing. Please set JWT_SECRET in .env for authentication.');
  }

  console.log('\n--- Environment Variable Inspection ---');
  if (errors.length > 0) {
    console.error('CRITICAL ERRORS:', errors);
  }
  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`⚠️ WARNING: ${w}`));
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All required environment variables are populated.');
  }
  console.log('-------------------------------------\n');

  return { errors, warnings };
}

module.exports = {
  config,
  validateEnv,
};
