const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testLogin() {
  try {
    console.log('🔍 Testiranje login-a...\n');
    
    // Get all users
    console.log('1. Učitavanje svih korisnika...');
    const users = await prisma.$queryRaw`
      SELECT id, email, name, passwordHash, [plan] FROM [User]
    `;
    
    console.log(`✅ Pronađeno ${users.length} korisnika:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   Hash dužina: ${user.passwordHash ? user.passwordHash.length : 0}`);
      console.log(`   Plan: ${user.plan}\n`);
    });
    
    if (users.length === 0) {
      console.log('❌ Nema korisnika u bazi!');
      return;
    }
    
    // Test login with last user (newest registered)
    const testEmail = users[users.length - 1].email;
    const testPassword = 'test123'; // Probaj sa ovom lozinkom
    
    console.log(`\n⚠️  Napomena: Prvi korisnik ima hash dužine ${users[0].passwordHash.length} (možda nije bcrypt)`);
    console.log(`   Testiram sa poslednjim korisnikom koji ima hash dužine ${users[users.length - 1].passwordHash.length}\n`);
    
    console.log(`2. Testiranje login-a za: ${testEmail}`);
    console.log(`   Probajem lozinku: ${testPassword}\n`);
    
    const loginUsers = await prisma.$queryRaw`
      SELECT id, email, name, passwordHash, [plan] FROM [User] WHERE email = ${testEmail}
    `;
    
    if (!loginUsers || loginUsers.length === 0) {
      console.log('❌ Korisnik nije pronađen!');
      return;
    }
    
    const user = loginUsers[0];
    
    if (!user.passwordHash) {
      console.log('❌ Password hash nije pronađen!');
      return;
    }
    
    console.log(`   Hash iz baze: ${user.passwordHash.substring(0, 20)}...`);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.passwordHash);
    
    if (isPasswordValid) {
      console.log('✅ Lozinka je VALIDNA!');
    } else {
      console.log('❌ Lozinka NIJE validna!');
      console.log('\n   Probajem da generišem novi hash za test...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log(`   Novi hash: ${newHash.substring(0, 30)}...`);
      const testCompare = await bcrypt.compare(testPassword, newHash);
      console.log(`   Test compare sa novim hash-om: ${testCompare ? '✅ VALIDNO' : '❌ NEVALIDNO'}`);
    }
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

