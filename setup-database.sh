#!/bin/bash

echo "🔧 Setting up local PostgreSQL database..."

# Get system username
USER=$(whoami)
echo "System username: $USER"

# Try to create database with system user
echo "Creating database 'task_management'..."
if createdb task_management 2>/dev/null; then
    echo "✅ Database created successfully!"
    echo "📝 Your DATABASE_URL should be:"
    echo "DATABASE_URL=\"postgresql://$USER@localhost:5432/task_management\""
else
    echo "❌ Database creation failed. Trying with postgres user..."
    
    # Try with postgres user
    if sudo -u postgres createdb task_management 2>/dev/null; then
        echo "✅ Database created with postgres user!"
        echo "📝 Your DATABASE_URL should be:"
        echo "DATABASE_URL=\"postgresql://postgres@localhost:5432/task_management\""
        echo "Note: You may need to set a password for postgres user"
    else
        echo "❌ Database creation failed. Manual setup required."
        echo "Please check your PostgreSQL installation."
    fi
fi

# Test connection
echo ""
echo "🧪 Testing database connection..."
if psql -h localhost -U $USER -d task_management -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Connection successful with user: $USER"
    echo "Use: DATABASE_URL=\"postgresql://$USER@localhost:5432/task_management\""
elif psql -h localhost -U postgres -d task_management -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Connection successful with user: postgres"
    echo "Use: DATABASE_URL=\"postgresql://postgres@localhost:5432/task_management\""
else
    echo "❌ Connection failed. You may need to:"
    echo "1. Start PostgreSQL service"
    echo "2. Set up a password for your user"
    echo "3. Configure PostgreSQL authentication"
fi

echo ""
echo "🔑 Next steps:"
echo "1. Copy the DATABASE_URL from above"
echo "2. Run: cp server/env.example server/.env"
echo "3. Edit server/.env with your DATABASE_URL"
echo "4. Add JWT secrets (see below)" 