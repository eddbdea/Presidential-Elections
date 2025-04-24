import express from 'express';
import { createTable, updateDescription, updateValidCandidate, candidatesList, getDescription, updateInvalidCandidate, didVote, updateNoVotes, canVote } from './db.js';
import router from './routes/user.js';
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
