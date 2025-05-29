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

//creates user table
export async function createUserTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS registered_users (
            id SERIAL UNIQUE,
            username TEXT PRIMARY KEY,
            password TEXT,
            profile_description TEXT DEFAULT 'Here is your description' NOT NULL,
            is_candidate INTEGER DEFAULT -1 NOT NULL,
            role TEXT DEFAULT 'user' NOT NULL
        )
    `)
}

//creates voting rounds table (start date + end date)
export async function createVotingRoundsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS voting_rounds (
            round_no SERIAL PRIMARY KEY,
            start_date DATE,
            end_date DATE
        )
    `)
    console.log('Table voting_rounds created successfully')
}

//table where we hold users that candidate in a specific round
export async function userCandidaciesTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_candidacies (
            round_no INTEGER REFERENCES voting_rounds(round_no),
            candidate_id INTEGER REFERENCES registered_users(id),   
            PRIMARY KEY(round_no, candidate_id)
        )
    `)
}

//table where we hold each voter, who voted for
export async function userVotes() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_votes (
            round_no INTEGER REFERENCES voting_rounds(round_no),
            voter_id INTEGER REFERENCES registered_users(id),
            candidate_id INTEGER REFERENCES registered_users(id),
            PRIMARY KEY (round_no, voter_id),
            CHECK (voter_id <> candidate_id)
        )
    `)
}

//creates a new user
export async function newUser(username, password) {
    await pool.query('INSERT INTO registered_users(username, password) VALUES ($1, $2)', [username, password]);
}

//add candidate into the rounds he participates
export async function candidateRounds(roundsArray, userId) {
    for (const round of roundsArray) {
        console.log(round);
        await pool.query('INSERT INTO user_candidacies (round_no, candidate_id) VALUES ($1, $2)', [round, userId]);
    }
}

//create new voting round
export async function newVotingRound(startDate, endDate) {
    await pool.query('INSERT INTO voting_rounds(start_date, end_date) VALUES ($1, $2)', [startDate, endDate]);
}

//gets the user password
export async function searchUser(username) {
    const user = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    return user.rows[0].password;
}

export async function votingRoundsList() {
    const votingRoundsList = await pool.query('SELECT * FROM voting_rounds WHERE start_date >= current_date');
    return votingRoundsList.rows;
}

//checks if the user is already registered
export async function validUser(username) {
    const user = await pool.query('SELECT username FROM registered_users WHERE username = $1', [username]);
    return user.rows.length > 0;
}

//updates the description of a certain user
export async function updateDescription(username, description) {
    await pool.query('UPDATE registered_users SET profile_description = $2 WHERE username = $1', [username, description]);
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

//set user as candidate
export async function updateValidCandidate(username) {
    await pool.query('UPDATE registered_users SET is_candidate = 1 WHERE username = $1', [username]);
}

//set the user as a non-candidate
export async function updateInvalidCandidate(username) {
    await pool.query('UPDATE registered_users SET is_candidate = 0 WHERE username = $1', [username]);
}

//get user role
export async function getRole(username) {
    const role = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    //console.log(role.rows[0].role);
    return role.rows[0].role;
}

//get user ID by username
export async function getUserId(username) {
    const userId = await pool.query('SELECT * FROM registered_users WHERE username = $1', [username]);
    console.log(userId.rows[0].id);
    return userId.rows[0].id;
}
