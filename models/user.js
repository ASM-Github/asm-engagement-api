const mongoose = require('mongoose');
const Joi = require('joi');
const PasswordComplexity = require('joi-password-complexity');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    minlength: 1,
    maxlength: 255,
    trim: true,
    unique: false,
    required: true,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    required: true,
  },
  user_type: {
    type: String,
    enum: ['admin', 'fellow', 'secretariat'],
    required: true,
  },
  fellow_desc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fellow',
  },

  created_date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(1).max(255).required().email(),
    password: new PasswordComplexity({
      min: 8,
      max: 25,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      requirementCount: 4,
    }),
    user_type: Joi.string().valid('admin', 'fellow', 'secretariat').required(),
    fellowId: Joi.number(),
  });

  return schema.validate(user);
};

const validateUpdate = (user) => {
  const schema = Joi.object({
    fellowId: Joi.string().required(),
  });

  return schema.validate(user);
};

exports.User = User;
exports.validate = validateUser;
exports.validateUpdate = validateUpdate;
exports.userSchema = userSchema;
