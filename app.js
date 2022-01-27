require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const errorLog = require('./middleware/errorLog');
const winston = require('winston');
require('winston-mongodb');
const app = express();
//custom import for development only
require('dotenv').config();
const cors = require('cors');

// Route Path
const usersRoutes = require('./routes/usersRoutes');
const programsRoutes = require('./routes/programsRoutes');
const activitiesRoutes = require('./routes/activitiesRoutes');
const fellowsRoutes = require('./routes/fellowsRoute');
const activitiesReqRoutes = require('./routes/activitiesReqRoutes');
const programsReqRoutes = require('./routes/programsReqRoutes');
const scoresRoutes = require('./routes/scoresRoutes');

const morgan = require('morgan');

winston.handleExceptions(
  new winston.transports.File({ filename: 'uncaughtException.log' })
);

process.on('unhandledRejection', (ex) => {
  throw ex;
});

//Write log to file or DB
winston.add(winston.transports.File, { filename: 'logfile.log' });
winston.add(winston.transports.MongoDB, {
  db: 'mongodb://localhost/fellow-engagement-db-v1',
  level: 'info',
});

// Database connection
mongoose
  .connect('mongodb://localhost/fellow-engagement-db-v1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('Successfully connected to mongoDB.');
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB..', err);
  });

// Server Listener
const PORT = process.env.PORT;
// const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV = 'development') {
  app.use(cors({ origin: `http://localhost:3000` }));
}

app.listen(PORT, () => {
  console.log('Server started on http://localhost:' + PORT);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/fellows', fellowsRoutes);
app.use('/api/activity-request', activitiesReqRoutes);
app.use('/api/program-request', programsReqRoutes);
app.use('/api/scores', scoresRoutes);

// logger
app.use(errorLog);

// Error Routes
app.get('*', (req, res) => {
  res.status(404).send('No resources found');
});
