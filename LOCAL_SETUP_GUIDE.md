# 🏠 Complete Local Setup Guide

## 📋 Overview

This guide explains exactly what credentials you need and how to set up the authentication system for **local development**. All data will be stored on your computer.

## 🔐 Understanding the Credentials

### DATABASE_URL: What You Actually Need

**The Format:** `postgresql://username:password@localhost:5432/database_name`

**What each part means:**
- `username`: Your PostgreSQL user (usually your system username)
- `password`: Your PostgreSQL password (often empty for local development)
- `localhost`: Your computer (not a remote server)
- `5432`: Default PostgreSQL port
- `database_name`: The database we'll create (`task_management`)

### JWT Secrets: What They Are

- **JWT_SECRET**: Used to sign access tokens (short-lived, 15 minutes)
- **JWT_REFRESH_SECRET**: Used to sign refresh tokens (long-lived, 7 days)
- **Requirements**: Must be long, random, and different from each other
- **Purpose**: Ensures only our app can create/verify tokens

## 🚀 Automated Setup (Recommended)

### Option 1: Complete Automated Setup

```bash
# This will set up everything automatically
npm run setup:complete
```

This command will:
1. Generate secure JWT secrets
2. Create your .env file with proper DATABASE_URL
3. Set up the database
4. Run database migrations
5. Generate Prisma client

### Option 2: Step-by-Step Automated Setup

```bash
# Step 1: Generate environment file with secure secrets
npm run setup:env

# Step 2: Set up database
npm run setup:db

# Step 3: Apply database schema
cd server
npm run db:push
npm run db:generate
```

## 🔧 Manual Setup (If Automated Fails)

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/)

### Step 2: Find Your PostgreSQL Credentials

#### Method A: Check Your System Username (Most Common)
```bash
# Your system username
whoami
# Example output: mafendemario

# Most likely your DATABASE_URL is:
# postgresql://mafendemario@localhost:5432/task_management
```

#### Method B: Test Database Connection
```bash
# Test connection with your system username (no password)
psql -h localhost -U $(whoami) -d postgres

# If this works, you don't need a password
# If it asks for a password, you need to set one or use different credentials
```

#### Method C: Use Default postgres User
```bash
# Try connecting as postgres user
psql -h localhost -U postgres -d postgres

# If this works, your DATABASE_URL is:
# postgresql://postgres@localhost:5432/task_management
# (You may need to set a password for postgres user)
```

### Step 3: Create Database

```bash
# Using your system username
createdb task_management

# OR using postgres user
sudo -u postgres createdb task_management
```

### Step 4: Generate JWT Secrets

```bash
# Generate both secrets
node -e "console.log('JWT_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"'); console.log('JWT_REFRESH_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"');"
```

### Step 5: Create .env File

```bash
# Copy template
cp server/env.example server/.env

# Edit with your actual values
nano server/.env  # or use your preferred editor
```

**Example .env content:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration - Choose ONE that works for you:
DATABASE_URL="postgresql://mafendemario@localhost:5432/task_management"
# OR DATABASE_URL="postgresql://postgres@localhost:5432/task_management"
# OR DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/task_management"

# JWT Configuration - Use the generated secrets
JWT_SECRET="your-generated-64-character-secret-here"
JWT_REFRESH_SECRET="your-different-generated-64-character-secret-here"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## 🧪 Testing Your Setup

### Test Database Connection
```bash
# Test with your credentials
psql -h localhost -U yourusername -d task_management -c "SELECT 1;"
```

### Test Application
```bash
# Install dependencies
npm install
npm run install:all

# Apply database schema
cd server
npm run db:push
npm run db:generate
cd ..

# Start application
npm run dev
```

**Look for these success messages:**
- `📊 Database connected successfully`
- `🚀 Server is running on port 5000`

## 🛠️ Troubleshooting

### Common PostgreSQL Issues

**1. "database does not exist"**
```bash
createdb task_management
```

**2. "role does not exist"**
```bash
# Create user with your system username
sudo -u postgres createuser --interactive
# Choose your system username and make it a superuser
```

**3. "password authentication failed"**
```bash
# Option A: Use no password
DATABASE_URL="postgresql://yourusername@localhost:5432/task_management"

# Option B: Set password for your user
sudo -u postgres psql
ALTER USER yourusername WITH PASSWORD 'newpassword';
\q
```

**4. "connection refused"**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

### Database URL Examples by System

**macOS (Homebrew install):**
```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/task_management"
```

**Ubuntu/Debian:**
```bash
DATABASE_URL="postgresql://$(whoami):password@localhost:5432/task_management"
```

**Windows:**
```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/task_management"
```

### Verify Your Setup

**Check PostgreSQL is running:**
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Windows
# Check Services in Windows or Task Manager
```

**Check database exists:**
```bash
psql -h localhost -U yourusername -l | grep task_management
```

## 📝 What Gets Stored Locally

**Database Location:**
- **macOS**: `/usr/local/var/postgres/` or `/opt/homebrew/var/postgres/`
- **Linux**: `/var/lib/postgresql/`
- **Windows**: `C:\Program Files\PostgreSQL\{version}\data\`

**Your Data:**
- User accounts (email, hashed passwords)
- Projects and tasks (when we build them)
- All authentication tokens
- Application settings

**Security:**
- Passwords are hashed with bcrypt (cannot be reversed)
- JWT secrets are unique to your installation
- No data leaves your computer

## 🎯 Next Steps

Once your setup is working:

1. **Test the authentication system** (see main README.md)
2. **Commit your changes** (excluding .env file)
3. **Move to Task 1.3: Professional UI Setup**

## 🔒 Security Notes

**DO NOT:**
- Commit your .env file to version control
- Share your JWT secrets
- Use these credentials in production

**DO:**
- Use different secrets for production
- Backup your local database if needed
- Change default passwords

## 🆘 Still Having Issues?

1. **Run the diagnostic script:**
   ```bash
   npm run setup:db
   ```

2. **Check the error logs:**
   ```bash
   npm run dev
   # Look for error messages in the terminal
   ```

3. **Verify PostgreSQL installation:**
   ```bash
   psql --version
   ```

4. **Check if database exists:**
   ```bash
   psql -h localhost -U $(whoami) -l
   ```

**Common working configurations:**
- `postgresql://mafendemario@localhost:5432/task_management`
- `postgresql://postgres@localhost:5432/task_management`
- `postgresql://yourusername:password@localhost:5432/task_management`

The key is finding which PostgreSQL user exists on your system and whether it has a password! 