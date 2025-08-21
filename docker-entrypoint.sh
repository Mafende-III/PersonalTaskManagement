#!/bin/sh
set -e

echo "Starting application initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => { console.log('Database connected'); process.exit(0); })
  .catch(() => { process.exit(1); });
" 2>/dev/null; do
  echo "Database is not ready - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
cd server && npx prisma migrate deploy || echo "Migration already applied or in development mode"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

cd ..

echo "Starting the application..."
exec "$@"