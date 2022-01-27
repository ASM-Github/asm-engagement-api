const winston = require('winston');

const errorLog = (err, req, res, next) => {
  winston.error(err.message, err);
  res.status(500).send('Something when wrong..');
};

module.exports = errorLog;
