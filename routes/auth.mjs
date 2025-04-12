import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import { newUser, searchUser, validUser } from '../db.mjs';
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/user/register', (req, res) => {
    res.render('./register/register-form');
})

router.get('/user/login', (req, res) => {
    res.render('./login/login-form');
})

//saving password into db
router.post('/user/register/form', async (req, res) => {
    const { username, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await newUser(username, hashedPassword);
        res.status(201).render('./register/valid-register');
    } catch (err) {
        console.log(err);
        res.status(500).render('./register/invalid-register');
    }
})

//checking if current user exists to login
router.post('/user/login/form', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!(await validUser(username))) {
            res.status(404).render('./login/invalid-login');
        } else {
            const userPassword = await searchUser(username);
            const passwordMatch = await bcrypt.compare(password, userPassword);
            if (passwordMatch) {
             res.render('./login/valid-login', {name: username});
            } else {
                res.status(404).render('./login/invalid-login');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(404).send('An error occurred');
    }
})

export default router;