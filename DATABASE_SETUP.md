# Database Setup Guide

## Required Setup for Task 1.2 Authentication

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install and start the service

### 2. Create Database

```bash
# Create database (replace with your preferred name)
createdb task_management
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp server/env.example server/.env

# Edit server/.env with your settings:
DATABASE_URL="postgresql://username:password@localhost:5432/task_management"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
```

**Important:** Replace `username`, `password`, and use strong, unique secrets for JWT keys.

### 4. Run Database Migration

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already done)
npm install

# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 5. Verify Setup

```bash
# Start the server
npm run dev

# Check if database connection is successful
# Look for: "📊 Database connected successfully"
```

## Database Commands Reference

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Run migrations (for production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists and credentials are correct

### Permission Issues
- Make sure your user has access to create databases
- Check PostgreSQL user permissions

### Schema Issues
- Run `npm run db:generate` after any schema changes
- Use `npm run db:push` for development
- Use `npm run db:migrate` for production

## What's Been Created

- **User Model**: Complete authentication-ready user model
- **Auth Utilities**: Password hashing, JWT generation/verification
- **Auth Middleware**: Token validation and user attachment
- **Auth Controllers**: Register, login, refresh, profile endpoints
- **Auth Routes**: Complete authentication API endpoints

## Next Steps

After successful setup, you can:
1. Test authentication endpoints (see README.md)
2. Move to Task 1.3: Professional UI Setup
3. Build the frontend authentication components 