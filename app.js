const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

const config = require('./config/env');

const httpPort = config.httpPort;

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('*', (req, res) => res.sendStatus(404));

app.listen(httpPort, () => {
  console.log(`Server listen: http://localhost:${httpPort}`);
});