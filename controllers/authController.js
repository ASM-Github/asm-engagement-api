const User = require('../models/Users/User');
const jwt = require('jsonwebtoken');

//handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  //incorrect email checks
  if (err.message === 'incorrect email') {
    errors.email = 'Email is incorrect';
  }

  //incorrect password checks
  if (err.message === 'incorrect password') {
    errors.password = 'Password is incorrect';
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.email = 'Email already exists';
    return errors;
  }

  //validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).map(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create sign jwt & max token days
const tokenAge = 3 * 24 * 60 * 60; // 3 days
const createToken = (id) => {
  return jwt.sign({ id }, 'secret weapon', {
    expiresIn: tokenAge,
  });
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: tokenAge * 1000 });
    res.status(201).json({
      userId: user._id,
      email: user.email,
      password: user.password,
      message: 'User successfully signup',
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: tokenAge * 1000 });
    res.status(200).json({ user: user._id, message: 'User successfuly login' });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// logout & remove token
module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.status(201).json({
    message: 'User successfully logout',
  });
};
