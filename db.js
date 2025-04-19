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
            profile_description TEXT DEFAULT 'Here is your description' NOT NULL,
            is_candidate INTEGER DEFAULT 0 NOT NULL,
            no_votes INTEGER DEFAULT 0 NOT NULL
        )
    `)
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

export async function updateDescription(username, description) {
    await pool.query('UPDATE registered_users SET profile_description = $2 WHERE username = $1'
        , [username, description]);
    console.log(username, description);
}

export async function getDescription(username) {
    const description = await pool.query ('SELECT * FROM registered_users WHERE username = $1', [username]);
    return description.rows[0].profile_description;
}

export async function isCandidate(username) {
    const validCandidate = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    return validCandidate.rows[0].is_candidate;
}

export async function candidatesList() {
    const validCandidates = await pool.query('SELECT * FROM registered_users WHERE is_candidate = 1');
    return validCandidates.rows;
}

export async function updateCandidate(username) {
    const candidate = pool.query('UPDATE registered_users SET is_candidate = 1 WHERE username = $1', [username]);
}

