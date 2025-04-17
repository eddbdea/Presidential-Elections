import express from 'express';
import { createTable, updateDescription } from './db.mjs';
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
app.post('/save/description', async (req, res) => {
    const { username, descriptionValue } = req.body;
    await updateDescription(username, descriptionValue);
})

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})
