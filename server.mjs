import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import {createTable, newUser, searchUser, validUser} from './db.mjs';
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('stylesheets'));

app.get('/', (req, res) => {
    res.render('homepage');
    createTable();
})

app.get('/user-register', (req, res) => {
    res.render('./register/register-form');
})

app.get('/user-login', (req, res) => {
    res.render('./login/login-form');
})

//saving password into db
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(password);
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //console.log('Hashed pass: ', hashedPassword);
        await newUser(username, hashedPassword);
        res.status(201).render('./register/valid-register');
    } catch (err) {
        console.log(err);
        res.status(500).render('./register/invalid-register');
    }
})

//checking if current user exists to login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!(await validUser(username))) {
            res.status(404).render('./login/invalid-login');
        }
        const userPassword = await searchUser(username);
        const passwordMatch = await bcrypt.compare(password, userPassword);
        if (passwordMatch) {
            res.render('./login/valid-login');
        } else {
            res.status(404).render('./login/invalid-login');
        }
    } catch (err) {
        console.log(err);
        res.status(404).send('An error occurred');
    }
})

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})