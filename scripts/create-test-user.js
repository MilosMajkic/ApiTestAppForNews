const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'test123';
    const name = 'Test User';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('✅ Korisnik već postoji!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        plan: 'FREE',
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        topics: '[]',
        sources: '[]',
        language: 'en',
      },
    });

    console.log('✅ Test korisnik kreiran uspešno!');
    console.log('\n📧 Login podaci:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log('\nMožeš se sada ulogovati na http://localhost:3000/login');
  } catch (error) {
    console.error('❌ Greška pri kreiranju korisnika:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();


