const express = require('express');
const { engine } = require('express-handlebars');
const { globalErrorMiddleware, errorHandler } = require('./middelwares/error-handler');
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

app.get(
  '*',
  errorHandler(() => {
    throw { status: 404, message: 'Page not found' };
  })
);

app.use(globalErrorMiddleware);

app.listen(httpPort, () => {
  console.log(`Server listen: http://localhost:${httpPort}`);
});
