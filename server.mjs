import express from 'express';
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {title : 'Bun venit'});

})

app.listen(port, () => {
    console.log(`Open server on localhost:${port}`);
})