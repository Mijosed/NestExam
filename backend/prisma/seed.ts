import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding...');
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('test1234', 10);

  const [user, , user1] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@test.fr',
        username: 'user',
        password,
        emailVerified: true,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@test.fr',
        username: 'admin',
        password,
        emailVerified: true,
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user1@test.fr',
        username: 'user1',
        password,
        emailVerified: true,
        role: 'USER',
      },
    }),
  ]);

  await prisma.movie.createMany({
    data: [
      {
        title: 'Inception',
        genre: 'Science-Fiction',
        year: 2010,
        rating: 5,
        note: "Chef-d'œuvre absolu",
        userId: user.id,
      },
      {
        title: 'Interstellar',
        genre: 'Science-Fiction',
        year: 2014,
        rating: 5,
        note: 'Époustouflant',
        userId: user.id,
      },
      {
        title: 'The Dark Knight',
        genre: 'Action',
        year: 2008,
        rating: 5,
        userId: user.id,
      },
      {
        title: 'Parasite',
        genre: 'Thriller',
        year: 2019,
        rating: 4,
        note: 'Brillant',
        userId: user.id,
      },
      {
        title: 'Oppenheimer',
        genre: 'Drame',
        year: 2023,
        rating: 4,
        userId: user1.id,
      },
      {
        title: 'Everything Everywhere All at Once',
        genre: 'Science-Fiction',
        year: 2022,
        rating: 5,
        note: 'Ovni cinématographique',
        userId: user1.id,
      },
      {
        title: 'Barbie',
        genre: 'Comédie',
        year: 2023,
        rating: 3,
        userId: user1.id,
      },
    ],
  });

  console.log('Seed terminé');
  console.log('user@test.fr   / test1234  (USER)');
  console.log('admin@test.fr  / test1234  (ADMIN)');
  console.log('user1@test.fr  / test1234  (USER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
