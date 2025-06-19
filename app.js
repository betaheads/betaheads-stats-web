const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');

const { engine } = require('express-handlebars');
const { globalErrorMiddleware, errorHandler, LocalError } = require('./middlewares/error-handler');
const path = require('path');

const app = express();

const config = require('./config/env');
const { playerRouter } = require('./routes/player-router');
const { leaderboardRouter } = require('./routes/leaderboard-router');

const httpPort = config.httpPort;

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(morgan('common'));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    },
  })
);

app.use(helmet());
app.use(helmet.xssFilter());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      imgSrc: ["'self'", 'data:', config.skinApi],
    },
  })
);

app.use(
  cors({
    origin: '*',
    methods: ['GET'],
  })
);

const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// ---------
// Routes
// ---------
app.use(playerRouter);
app.use(leaderboardRouter);

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
