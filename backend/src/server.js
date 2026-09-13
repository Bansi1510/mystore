const app = require('./app');
const { config, validateEnv } = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  console.log('\n🚀 Starting Personal Cloud File Manager Server...');
  validateEnv();
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`\n✅ Server is running on port ${config.port} [${config.nodeEnv}]`);
    console.log(`🌐 API Base URL: http://localhost:${config.port}/api`);
    console.log(`🏥 Health Check: http://localhost:${config.port}/api/health\n`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message || err);
  });
}

startServer();
