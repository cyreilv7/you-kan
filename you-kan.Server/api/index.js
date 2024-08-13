/*
    Sets up main server application (middleware, routes)
    Connects to database and starts node.js server
*/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('../db/db-connector');


require('dotenv').config();

const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');

const passport = require('passport');
const logger = require('morgan');

const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Initialize session store
const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000, // Check expiration every 15 minutes
  expiration: 24 * 60 * 60 * 1000, // Session expiration time (24 hours)
});

// Check database connection and sync models
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

sequelize.sync()
  .then(() => console.log('Models synchronized...'))
  .catch(err => console.log('Error: ' + err));

const app = express();

app.locals.pluralize = require('pluralize');

// CORS Configuration
const corsOptions = {
  origin: 'https://you-kan.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true
};

// middleware
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json()) 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure session middleware
app.use(session({
  secret: 'abc', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Use the Sequelize session store instance
  cookie: {
    secure: true,
    sameSite: 'None'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  const msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});

const taskRoutes = require('../routes/taskRoutes');
const projectRoutes = require('../routes/projectRoutes')
const userRoutes = require('../routes/userRoutes')
const sprintRoutes = require('../routes/sprintRoutes')
const subtaskRoutes = require('../routes/subtaskRoutes')
const commentRoutes = require('../routes/commentRoutes')
const authRoutes = require('../routes/authRoutes')

// routes
app.use('/api/tasks', taskRoutes);
app.use('/api/subtasks', subtaskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/', authRoutes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;