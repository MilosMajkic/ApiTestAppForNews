const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔍 Testiranje konekcije...\n');
    
    // Test 1: Povezivanje
    console.log('1. Povezivanje na bazu...');
    await prisma.$connect();
    console.log('✅ Povezan!\n');
    
    // Test 2: Broj korisnika
    console.log('2. Broj korisnika u bazi...');
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM [User]`;
    console.log(`✅ Broj korisnika: ${count[0].count}\n`);
    
    // Test 3: Provera da li korisnik postoji
    console.log('3. Provera korisnika sa email-om test@test.com...');
    const users = await prisma.$queryRaw`
      SELECT id, email, name FROM [User] WHERE email = 'test@test.com'
    `;
    
    if (users && users.length > 0) {
      console.log(`✅ Korisnik postoji: ${users[0].email}`);
    } else {
      console.log('ℹ️  Korisnik ne postoji');
    }
    
    console.log('\n✅ Sve testove prošlo uspešno!');
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();


