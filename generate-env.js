#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Generating environment configuration...\n');

// Get system username
const username = process.env.USER || process.env.USERNAME || 'postgres';
console.log(`System username: ${username}`);

// Generate JWT secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated JWT secrets');

// Common DATABASE_URL options for local development
const databaseOptions = [
  `postgresql://${username}@localhost:5432/task_management`,
  `postgresql://${username}:password@localhost:5432/task_management`,
  `postgresql://postgres@localhost:5432/task_management`,
  `postgresql://postgres:password@localhost:5432/task_management`
];

console.log('\n🔗 Common DATABASE_URL options for local development:');
databaseOptions.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

// Create .env content
const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
# Choose one of the following based on your PostgreSQL setup:
# Option 1: No password (common for local development)
DATABASE_URL="postgresql://${username}@localhost:5432/task_management"
# Option 2: With password
# DATABASE_URL="postgresql://${username}:yourpassword@localhost:5432/task_management"
# Option 3: Using postgres user
# DATABASE_URL="postgresql://postgres@localhost:5432/task_management"

# JWT Configuration (DO NOT CHANGE - These are secure random secrets)
JWT_SECRET="${jwtSecret}"
JWT_REFRESH_SECRET="${jwtRefreshSecret}"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for future use)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# OAuth Configuration (for future use)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
`;

// Write to server/.env
const envPath = path.join(__dirname, 'server', '.env');
fs.writeFileSync(envPath, envContent);

console.log(`\n✅ Created ${envPath}`);
console.log('\n📝 Your .env file has been created with:');
console.log(`- Secure JWT secrets (64 characters each)`);
console.log(`- Default DATABASE_URL for user: ${username}`);
console.log(`- Development configuration`);

console.log('\n🔧 Next steps:');
console.log('1. Ensure PostgreSQL is running');
console.log('2. Create the database: createdb task_management');
console.log('3. If the default DATABASE_URL doesn\'t work, edit server/.env');
console.log('4. Run: cd server && npm run db:push && npm run db:generate');
console.log('5. Start the application: npm run dev');

console.log('\n💡 If you encounter database connection issues:');
console.log('- Check PostgreSQL is running: brew services list | grep postgresql');
console.log('- Try different DATABASE_URL options from above');
console.log('- Run the setup script: bash setup-database.sh'); 