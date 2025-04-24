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
            is_candidate INTEGER DEFAULT -1 NOT NULL,
            no_votes INTEGER DEFAULT 0 NOT NULL,
            did_vote BOOLEAN DEFAULT FALSE NOT NULL
        )
    `)
}

//creates a new user
export async function newUser(username, password) {
    await pool.query(`
        INSERT INTO registered_users(username, password) VALUES ($1, $2)
        `, [username, password]
    )
}

//gets the user password
export async function searchUser(username) {
    const user = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    return user.rows[0].password;
}

//checks if the user is already registered
export async function validUser(username) {
    const user = await pool.query('SELECT username FROM registered_users WHERE username = $1', [username]);
    return user.rows.length > 0;
}

//updates the description of a certain user
export async function updateDescription(username, description) {
    await pool.query('UPDATE registered_users SET profile_description = $2 WHERE username = $1'
        , [username, description]);
    console.log(username, description);
}

//gets the profile description of a certain user
export async function getDescription(username) {
    const description = await pool.query ('SELECT * FROM registered_users WHERE username = $1', [username]);
    return description.rows[0].profile_description;
}

//checks the candidate status of the user
export async function isCandidate(username) {
    const validCandidate = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    return validCandidate.rows[0].is_candidate;
}

//returns the entire candidates list
export async function candidatesList() {
    const validCandidates = await pool.query('SELECT * FROM registered_users WHERE is_candidate = 1');
    return validCandidates.rows;
}

//set user as candidate
export async function updateValidCandidate(username) {
    await pool.query('UPDATE registered_users SET is_candidate = 1 WHERE username = $1', [username]);
}

//set the user as a non-candidate
export async function updateInvalidCandidate(username) {
    await pool.query('UPDATE registered_users SET is_candidate = 0 WHERE username = $1', [username]);
}

//check if the current user already voted
export async function canVote(username) {
    const response = await pool.query('SELECT did_vote FROM registered_users WHERE username = $1', [username]);
    return response.rows[0].did_vote;
}

//updates number of votes for this candidate
export async function updateNoVotes(userId) {
    await pool.query('UPDATE registered_users SET no_votes = no_votes + 1 WHERE id = $1', [userId]);
}

//updates status from a user that didnt vote, to a user that did vote
export async function didVote(username) {
    await pool.query('UPDATE registered_users SET did_vote = TRUE WHERE username = $1', [username]);
}