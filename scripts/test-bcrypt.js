const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testBcrypt() {
  try {
    console.log('🔍 Testiranje bcrypt-a...\n');
    
    // Get user
    const email = 'mmajkic323@gmail.com';
    console.log(`1. Učitavanje korisnika: ${email}`);
    
    const users = await prisma.$queryRaw`
      SELECT id, email, name, passwordHash, [plan] FROM [User] WHERE email = ${email}
    `;
    
    if (!users || users.length === 0) {
      console.log('❌ Korisnik nije pronađen!');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Korisnik pronađen: ${user.name}`);
    console.log(`   Hash dužina: ${user.passwordHash.length}`);
    console.log(`   Hash (prvih 30): ${user.passwordHash.substring(0, 30)}...`);
    console.log(`   Hash (poslednjih 10): ...${user.passwordHash.substring(user.passwordHash.length - 10)}`);
    
    // Test sa različitim lozinkama
    const testPasswords = [
      'test123',
      'Test123',
      'TEST123',
      'majkic123',
      'Milos123',
    ];
    
    console.log('\n2. Testiranje različitih lozinki:\n');
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, user.passwordHash.trim());
      console.log(`   "${password}": ${isValid ? '✅ VALIDNO' : '❌ NEVALIDNO'}`);
    }
    
    // Test sa trimovanim hash-om
    console.log('\n3. Testiranje sa trimovanim hash-om:\n');
    const trimmedHash = user.passwordHash.trim();
    console.log(`   Originalna dužina: ${user.passwordHash.length}`);
    console.log(`   Trimovana dužina: ${trimmedHash.length}`);
    
    if (user.passwordHash.length !== trimmedHash.length) {
      console.log('   ⚠️  Hash ima dodatne razmake!');
    }
    
    // Test generisanje novog hash-a
    console.log('\n4. Generisanje novog hash-a za test:\n');
    const testPassword = 'test123';
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log(`   Novi hash: ${newHash.substring(0, 30)}...`);
    const testCompare = await bcrypt.compare(testPassword, newHash);
    console.log(`   Test compare: ${testCompare ? '✅ VALIDNO' : '❌ NEVALIDNO'}`);
    
    // Test compare sa starim hash-om
    console.log('\n5. Test compare sa hash-om iz baze:\n');
    const oldHashCompare = await bcrypt.compare(testPassword, trimmedHash);
    console.log(`   Compare sa "${testPassword}": ${oldHashCompare ? '✅ VALIDNO' : '❌ NEVALIDNO'}`);
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testBcrypt();


