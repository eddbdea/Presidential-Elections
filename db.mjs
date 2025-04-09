import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool( {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    port: parseInt(process.env.PG_PORT),
    password: process.env.PG_PASSWORD
})

async function createTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS registered_users (
            username PRIMARY KEY VARCHAR[20],
            password VARCHAR[20]
        )
    `)
}