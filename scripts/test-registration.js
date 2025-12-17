const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testRegistration() {
  try {
    console.log('🔍 Testiranje registracije...\n');
    
    const email = 'test2@test.com';
    const name = 'Test User 2';
    const password = 'test123';
    
    // Check if user exists
    console.log('1. Provera da li korisnik postoji...');
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM [User] WHERE email = ${email}
    `;
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  Korisnik već postoji');
      return;
    }
    console.log('✅ Korisnik ne postoji\n');
    
    // Hash password
    console.log('2. Hash-ovanje lozinke...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Lozinka hash-ovana\n');
    
    // Generate IDs
    const userId = crypto.randomUUID();
    const preferencesId = crypto.randomUUID();
    const now = new Date();
    
    console.log('3. Kreiranje korisnika...');
    await prisma.$executeRaw`
      INSERT INTO [User] (id, email, name, passwordHash, [plan], createdAt, updatedAt)
      VALUES (${userId}, ${email}, ${name}, ${passwordHash}, 'FREE', ${now}, ${now})
    `;
    console.log('✅ Korisnik kreiran\n');
    
    console.log('4. Kreiranje preferences...');
    await prisma.$executeRaw`
      INSERT INTO [UserPreferences] (id, userId, topics, sources, language, darkMode, autoDarkMode, createdAt, updatedAt)
      VALUES (${preferencesId}, ${userId}, '[]', '[]', 'en', 0, 1, ${now}, ${now})
    `;
    console.log('✅ Preferences kreirani\n');
    
    console.log('5. Provera kreiranog korisnika...');
    const users = await prisma.$queryRaw`
      SELECT id, email, name FROM [User] WHERE id = ${userId}
    `;
    
    if (users && users.length > 0) {
      console.log('✅ Korisnik uspešno kreiran:', users[0]);
    } else {
      console.log('❌ Korisnik nije kreiran');
    }
    
    console.log('\n✅ Registracija testirana uspešno!');
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
