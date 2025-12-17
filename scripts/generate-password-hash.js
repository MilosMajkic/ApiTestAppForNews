const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'test123';
  const hash = await bcrypt.hash(password, 10);
  console.log('\n✅ Password hash generisan:');
  console.log(hash);
  console.log('\nKoristi ovaj hash u SQL skripti!');
}

generateHash();


