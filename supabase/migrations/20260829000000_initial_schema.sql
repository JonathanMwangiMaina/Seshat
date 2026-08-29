-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VENDOR', 'CUSTOMER');

-- Create User table
CREATE TABLE "User" (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email           TEXT UNIQUE NOT NULL,
    name            TEXT,
    "passwordHash"  TEXT NOT NULL,
    role            "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetToken"    TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User table
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data (except role)
CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Admins can read all users
CREATE POLICY "Admins can view all users" ON "User"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON "User"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access" ON "User"
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to User table
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);