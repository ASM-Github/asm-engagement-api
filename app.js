const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// middleware
app.use(express.json());
app.use(morgan('tiny'));

// database connection
const dbURI = 'mongodb://localhost:27017/asm-nomination';
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes list
app.use(authRoutes);
app.use(userRoutes);
