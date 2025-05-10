import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import { 
    getDescription, 
    newUser, 
    searchUser, 
    validUser, 
    isCandidate, 
    candidatesList, 
    getRole,
    createVotingRoundsTable,
    newVotingRound,
    overlapsDate
} from '../db.js';
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/user/register', (req, res) => {
    res.render('./register/register-form');
})

router.get('/user/login', (req, res) => {
    res.render('./login/login-form');
})

//saving password into db
router.post('/user/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await newUser(username, hashedPassword);
        res.status(201).render('./register/valid-register');
    } catch (err) {
        console.log(err);
        res.render('./register/invalid-register');
        next(err);
    }
})

//checking if current user exists to login
router.post('/user/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        if (!(await validUser(username))) {
            res.status(404).render('./login/invalid-login');
        } else {
            const validCandidate = await isCandidate(username);
            const userDescription = await getDescription(username);
            const list = await candidatesList();
            const userPassword = await searchUser(username);
            const passwordMatch = await bcrypt.compare(password, userPassword);
            if (passwordMatch) {
                if (await getRole(username) === 'admin') {
                    await createVotingRoundsTable();
                    res.redirect('/auth/user/login/admin-panel')
                } else {
                    res.render('./login/valid-login', 
                    {name: username, description: userDescription, candidateValue: validCandidate, userlist: list});
                }
            } else {
                res.status(404).render('./login/invalid-login');
            }
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
})

//admin panel route, renders admin panel page
router.get('/user/login/admin-panel', (req, res) => {
    res.render('./user/admin-panel');
})

//if round date doesnt overlap existing dates, we add it in DB else we dont
router.post('/user/admin/round-date', async (req, res, next) => {
    const {startingDate, endingDate} = req.body;
    const dateStart = new Date(startingDate).getTime();
    const dateEnd = new Date(endingDate).getTime();
    try {
        if (dateEnd < dateStart) {
            res.render('./user/invalid-date');
            console.log("End date is less then start date, invalid!")
        } else if (!await overlapsDate(startingDate, endingDate)) {
            await newVotingRound(startingDate, endingDate);
            console.log("Date is valid!");
            res.render('./user/valid-date');
        } else {
            console.log("Date already taken");
            res.render('./user/invalid-date');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
})

//global error route handler
router.use((err, req, res, next) => {
    console.log(err);
    res.status(500);
})

export default router;