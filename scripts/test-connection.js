const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔍 Testiranje konekcije sa bazom...\n');
    
    // Test 1: Povezivanje
    console.log('1. Povezivanje na bazu...');
    await prisma.$connect();
    console.log('✅ Povezan na bazu!\n');
    
    // Test 2: Broj korisnika
    console.log('2. Broj korisnika u bazi...');
    const userCount = await prisma.user.count();
    console.log(`✅ Broj korisnika: ${userCount}\n`);
    
    // Test 3: Kreiranje test korisnika
    console.log('3. Kreiranje test korisnika...');
    const testEmail = `test-${Date.now()}@example.com`;
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('test123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        passwordHash,
        plan: 'FREE',
      },
    });
    console.log(`✅ Korisnik kreiran: ${user.email}\n`);
    
    // Test 4: Kreiranje preferences
    console.log('4. Kreiranje preferences...');
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        topics: '[]',
        sources: '[]',
        language: 'en',
      },
    });
    console.log('✅ Preferences kreirane!\n');
    
    // Cleanup
    console.log('5. Čišćenje test podataka...');
    await prisma.userPreferences.deleteMany({
      where: { userId: user.id },
    });
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ Test podaci obrisani!\n');
    
    console.log('🎉 Sve radi! Baza je pravilno povezana i funkcionalna!');
    
  } catch (error) {
    console.error('❌ GREŠKA:', error);
    if (error.message) {
      console.error('Poruka:', error.message);
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();


