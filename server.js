import express from 'express';
import { 
    createUserTable, 
    updateDescription, 
    updateValidCandidate, 
    candidatesList, 
    getDescription, 
    updateInvalidCandidate, 
    didVote, 
    updateNoVotes, 
    canVote,
    newVotingRound
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
    const newList = await candidatesList();
    res.render('homepage', {userlist: newList});
})

//auth route register/login
app.use('/auth', router);

//insert start date and end date into DB
app.post('/user/admin/rounds-table', async (req, res) => {
    const { start_date, end_date } = req.body;
    await newVotingRound(start_date, end_date);
    console.log('start date:', start_date,  'end date:', end_date);
    res.status(200);
})

//live change user profile description
app.put('/save/description', async (req, res) => {
    const { username, descriptionValue } = req.body;
    await updateDescription(username, descriptionValue);
    res.status(200);
})

//user participates on the election as a candidate
app.put('/user/candidate', async (req, res) => {
    const { username } = req.body;
    await updateValidCandidate(username);
    const newList = await candidatesList();
    res.render('./user/candidate-list', { userlist: newList })
})

//user doeesnt participate as a candidate
app.put('/user/not-candidate', async (req, res) => {
    const { username } = req.body;
    await updateInvalidCandidate(username);
    const newList = await candidatesList();
    res.render('./user/candidate-list', { userlist: newList })
})

//update number of votes and make the user to not be able to vote anymore
app.put('/user/update-votes', async (req, res) => {
    const { username, userId } = req.body;
    if (await canVote(username) === false) {
        await updateNoVotes(userId);
        await didVote(username);
    }
    const newList = await candidatesList();
    res.render('./user/candidate-list', { userlist: newList });
})

//render candidate profile
app.get('/user/profile/:username', async (req, res) => {
    const username = req.params.username;
    const profileDescription = await getDescription(username);
    res.render('./user/user-profile', { name: username, description: profileDescription});
})

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})
