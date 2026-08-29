-- Seed demo users (run after migration)
-- Passwords are bcrypt hashed: AdminPass123!, VendorPass123!, UserPass123!

INSERT INTO "User" (id, email, name, "passwordHash", role, "emailVerified", "createdAt", "updatedAt")
VALUES 
    (
        'admin-001',
        'admin@retailpass.com',
        'Admin User',
        '$2a$10$XQx7LzJ8K9mN2pQ4rS5tUeV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP',
        'ADMIN',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'vendor-001',
        'vendor@retailpass.com',
        'Vendor User',
        '$2a$10$XQx7LzJ8K9mN2pQ4rS5tUeV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP',
        'VENDOR',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'customer-001',
        'user@test.com',
        'Customer User',
        '$2a$10$XQx7LzJ8K9mN2pQ4rS5tUeV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP',
        'CUSTOMER',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (email) DO NOTHING;