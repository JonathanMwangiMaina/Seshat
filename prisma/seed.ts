import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding demo users...');

  const passwordHash = await bcrypt.hash('AdminPass123!', 10);

  const users = [
    {
      id: 'admin-001',
      email: 'admin@retailpass.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN' as const,
      emailVerified: true,
    },
    {
      id: 'vendor-001',
      email: 'vendor@retailpass.com',
      name: 'Vendor User',
      passwordHash: await bcrypt.hash('VendorPass123!', 10),
      role: 'VENDOR' as const,
      emailVerified: true,
    },
    {
      id: 'customer-001',
      email: 'user@test.com',
      name: 'Customer User',
      passwordHash: await bcrypt.hash('UserPass123!', 10),
      role: 'CUSTOMER' as const,
      emailVerified: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    console.log(`Created/updated user: ${user.email} (${user.role})`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });