import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SuperAdmin' },
    update: {},
    create: {
      name: 'SuperAdmin',
      description: 'Full administrative access to the system',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Standard administrative access for golf course management',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'Client' },
    update: {},
    create: {
      name: 'Client',
      description: 'Regular user with booking capabilities',
    },
  });

  // Create Super Admin User
  const hashedPasswordSuperAdmin = await bcrypt.hash('SuperAdmin2025!', 10);
  await prisma.user.upsert({
    where: { email: 'oscargomez@teereserve.golf' },
    update: {},
    create: {
      email: 'oscargomez@teereserve.golf',
      name: 'Oscar Gomez',
      password: hashedPasswordSuperAdmin,
      roleId: superAdminRole.id,
    },
  });

  // Create Admin User
  const hashedPasswordAdmin = await bcrypt.hash('Admin2025!', 10);
  await prisma.user.upsert({
    where: { email: 'info@teereserve.golf' },
    update: {},
    create: {
      email: 'info@teereserve.golf',
      name: 'TeeReserve Admin',
      password: hashedPasswordAdmin,
      roleId: adminRole.id,
    },
  });

  console.log('Roles and users seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


