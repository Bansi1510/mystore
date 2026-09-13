const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2];
  if (!password) {
    console.log('\nUsage: node backend/src/utils/hashPassword.js <your_password>\n');
    console.log('Example: node backend/src/utils/hashPassword.js mySecretPass123');
    process.exit(1);
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('\n==================================================');
  console.log(`Password: ${password}`);
  console.log(`Bcrypt Hash: ${hash}`);
  console.log('==================================================\n');
  console.log('Copy the hash above into your backend .env file:\n');
  console.log(`NORMAL_USER_PASSWORD_HASH=${hash}`);
  console.log('or');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
}

generateHash().catch(console.error);
