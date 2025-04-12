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

export async function createTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS registered_users (
            id SERIAL,
            username TEXT PRIMARY KEY,
            password TEXT,
            profile_description TEXT
        )
    `)
    console.log('table created');
}

export async function newUser(username, password) {
    await pool.query(`
        INSERT INTO registered_users(username, password) VALUES ($1, $2)
        `, [username, password]
    )
}

export async function searchUser(username) {
    const user = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    return user.rows[0].password;
}

export async function validUser(username) {
    const user = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    return user.rows.length > 0;
}
