const express = require('express');
const { engine } = require('express-handlebars');
const { globalErrorMiddleware, errorHandler, LocalError } = require('./middlewares/error-handler');
const path = require('path');

const app = express();

const config = require('./config/env');
const { playerRouter } = require('./routes/player-router');

const httpPort = config.httpPort;

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(playerRouter);

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '*',
  errorHandler(() => {
    throw new LocalError(404, 'Page not found');
  })
);

app.use(globalErrorMiddleware);

app.listen(httpPort, () => {
  console.log(`Server listen: http://localhost:${httpPort}`);
});
