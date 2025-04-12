import express from 'express';
import { createTable } from './db.mjs';
import router from './routes/auth.mjs';
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('homepage');
    createTable();
})

//auth route register/login
app.use('/auth', router);

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})