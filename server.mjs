import express from 'express';
import { createTable, updateDescription, updateCandidate, candidatesList, getDescription } from './db.mjs';
import router from './routes/user.mjs';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;

router.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); 

app.get('/', (req, res) => {
    res.render('homepage');
    createTable();
})

//auth route register/login
app.use('/auth', router);

//live change user profile description
app.put('/save/description', async (req, res) => {
    const { username, descriptionValue } = req.body;
    await updateDescription(username, descriptionValue);
})

app.put('/user/participate', async (req, res) => {
    const { username } = req.body;
    await updateCandidate(username);
    const newList = await candidatesList();
    res.render('./user/candidate-list', { userlist: newList })
})

app.get('/user/candidates', async (req, res) => {
    const newList = await candidatesList();
    res.render('./user/candidate-list', { userlist: newList })
})

app.get('/user/profile/:username', async (req, res) => {
    const username = req.params.username;
    const profileDescription = await getDescription(username);
    res.render('./user/user-profile', { name: username, description: profileDescription});
})

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})
