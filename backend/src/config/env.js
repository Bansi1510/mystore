const path = require('path');
const dotenv = require('dotenv');

// Attempt to load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_me_in_env',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_change_me',
  normalUserHash: process.env.NORMAL_USER_PASSWORD_HASH || '',
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
    warnings.push('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET) are missing. File uploads will fail gracefully.');
  }

  if (!config.normalUserHash) {
    warnings.push('NORMAL_USER_PASSWORD_HASH is missing in .env. Normal user login will fail until set.');
  }

  if (!config.adminHash) {
    warnings.push('ADMIN_PASSWORD_HASH is missing in .env. Admin user login will fail until set.');
  }

  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET is using fallback key. Set JWT_SECRET in .env for security.');
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
