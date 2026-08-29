#!/bin/bash
# Run Supabase migrations
# Usage: ./supabase/migrate.sh

set -e

echo "Running Supabase migrations..."

# Check for required environment variables
if [ -z "$SUPABASE_DATABASE_URL" ]; then
    echo "Error: SUPABASE_DATABASE_URL not set"
    exit 1
fi

# Run migrations using psql
for migration in supabase/migrations/*.sql; do
    echo "Applying $migration..."
    psql "$SUPABASE_DATABASE_URL" -f "$migration"
done

# Run seed data
echo "Seeding demo users..."
psql "$SUPABASE_DATABASE_URL" -f supabase/seed.sql

echo "Migrations complete!"