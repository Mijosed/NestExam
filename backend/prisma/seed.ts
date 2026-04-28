import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding...');
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('test1234', 10);

  await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@test.fr',
        username: 'user',
        password,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@test.fr',
        username: 'admin',
        password,
        emailVerified: true,
      },
    }),
  ]);

  console.log('Seed terminé');
  console.log('user@test.fr / test1234');
  console.log('admin@test.fr / test1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
