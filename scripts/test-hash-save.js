const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testHashSave() {
  try {
    console.log('🔍 Testiranje čuvanja i čitanja hash-a...\n');
    
    const email = 'test-hash@test.com';
    const password = 'test123';
    const name = 'Test Hash';
    
    // Delete existing user
    await prisma.$executeRaw`DELETE FROM [User] WHERE email = ${email}`;
    console.log('1. Obrisan postojeći korisnik (ako postoji)\n');
    
    // Hash password
    console.log('2. Hash-ovanje lozinke...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(`   Hash generisan: ${passwordHash.substring(0, 30)}...`);
    console.log(`   Hash dužina: ${passwordHash.length}\n`);
    
    // Test compare pre čuvanja
    const testBefore = await bcrypt.compare(password, passwordHash);
    console.log(`3. Test compare PRE čuvanja: ${testBefore ? '✅ VALIDNO' : '❌ NEVALIDNO'}\n`);
    
    // Create user
    const userId = crypto.randomUUID();
    const preferencesId = crypto.randomUUID();
    const now = new Date();
    
    console.log('4. Čuvanje korisnika u bazu...');
    await prisma.$executeRaw`
      INSERT INTO [User] (id, email, name, passwordHash, [plan], createdAt, updatedAt)
      VALUES (${userId}, ${email}, ${name}, ${passwordHash}, 'FREE', ${now}, ${now})
    `;
    console.log('   ✅ Korisnik sačuvan\n');
    
    // Read back
    console.log('5. Čitanje hash-a iz baze...');
    const users = await prisma.$queryRaw`
      SELECT passwordHash FROM [User] WHERE email = ${email}
    `;
    
    if (!users || users.length === 0) {
      console.log('❌ Korisnik nije pronađen!');
      return;
    }
    
    const savedHash = users[0].passwordHash;
    console.log(`   Hash pročitan: ${savedHash.substring(0, 30)}...`);
    console.log(`   Hash dužina: ${savedHash.length}`);
    console.log(`   Hashovi se poklapaju: ${passwordHash === savedHash ? '✅ DA' : '❌ NE'}\n`);
    
    // Test compare posle čitanja
    console.log('6. Test compare POSLE čitanja...');
    const testAfter = await bcrypt.compare(password, savedHash);
    console.log(`   Compare sa "${password}": ${testAfter ? '✅ VALIDNO' : '❌ NEVALIDNO'}\n`);
    
    // Test sa trimovanim hash-om
    const trimmedHash = savedHash.trim();
    if (trimmedHash.length !== savedHash.length) {
      console.log('7. Hash ima dodatne razmake, testiram sa trimovanim...');
      const testTrimmed = await bcrypt.compare(password, trimmedHash);
      console.log(`   Compare sa trimovanim: ${testTrimmed ? '✅ VALIDNO' : '❌ NEVALIDNO'}\n`);
    }
    
    console.log('✅ Test završen!');
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testHashSave();


