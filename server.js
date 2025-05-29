import express from 'express';
import { 
    createUserTable, 
    updateDescription, 
    updateValidCandidate,
    getDescription, 
    updateInvalidCandidate,
    getUserId,
    candidateRounds,
    userCandidaciesTable
} from './db.js';
import router from './routes/user.js';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); 

app.get('/', async (req, res) => {
    await createUserTable();
    res.render('homepage');
})

//auth route register/login
app.use('/auth', router);

//get dates where candidate wants to participate and save them into the DB
app.post('/user/candidate/success', async (req, res) => {
    const { roundNo, username } = req.body;
    await userCandidaciesTable();
    const userId = await getUserId(username);
    await candidateRounds(roundNo, userId);
    res.status(200);
})

//live change user profile description
app.put('/save/description', async (req, res) => {
    const { username, descriptionValue } = req.body;
    await updateDescription(username, descriptionValue);
    res.status(200);
})

//render candidate profile
app.get('/user/profile/:username', async (req, res) => {
    const username = req.params.username;
    const profileDescription = await getDescription(username);
    res.render('./user/user-profile', { name: username, description: profileDescription});
})

app.put('/user/candidate', async (req, res) => {
    const { username } = req.body;
    await updateValidCandidate(username);
    res.status(200).json({message: "User marked as candidate!"});
})

app.put('/user/vote', async (req, res) => {
    const { username } = req.body;
    await updateInvalidCandidate(username);
    res.status(200).json({ message: "User marked as not candidate!"});
})

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})
