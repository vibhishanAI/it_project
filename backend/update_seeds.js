const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function run() {
    const salt = await bcrypt.genSalt(10);
    // Let's make the default password for all seed users 'password123'
    const hash = await bcrypt.hash('password123', salt);
    
    const seedPath = path.join(__dirname, '../seed_dml.sql');
    let sql = fs.readFileSync(seedPath, 'utf8');
    
    // Replace 'hash1', 'hash2' etc with the real hash
    sql = sql.replace(/'hash\d+'/g, `'${hash}'`);
    
    fs.writeFileSync(seedPath, sql);
    console.log('Seed file updated successfully with valid bcrypt hash.');
}
run();
