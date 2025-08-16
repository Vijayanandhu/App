// backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- YOU CAN CHANGE THESE DETAILS ---
  const adminEmail = 'admin@example.com';
  const adminUsername = 'admin';
  const adminPassword = 'password123'; // Choose a strong password for production
  // ------------------------------------

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // This command will create the admin user only if it doesn't already exist.
  // This is safer than .create() because you can run the seed command multiple times.
  const admin = await prisma.user.upsert({
    where: { email: adminEmail }, // Look for a user with this unique email
    update: {}, // If the user exists, do nothing
    create: {   // If the user does not exist, create them with this data
      username: adminUsername,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      joinDate: new Date(),
    },
  });

  console.log(`✅ Created or found admin user: ${admin.email}`);
  console.log(`   Username: ${adminUsername}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Please use these credentials to log in.`);
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });