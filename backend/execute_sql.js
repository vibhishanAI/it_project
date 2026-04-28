require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        
        console.log('Connected to MySQL. Running DDL schema...');
        const ddl = fs.readFileSync(path.join(__dirname, '../schema_ddl.sql'), 'utf-8');
        await connection.query(ddl);
        console.log('DDL execution finished.');

        console.log('Running DML seed data...');
        const dml = fs.readFileSync(path.join(__dirname, '../seed_dml.sql'), 'utf-8');
        await connection.query(dml);
        console.log('DML execution finished.');

        await connection.end();
        console.log('Database Initialization Complete.');
    } catch (e) {
        console.error('Error during database initialization:', e);
    }
}
run();
