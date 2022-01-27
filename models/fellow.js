const mongoose = require('mongoose');
const Joi = require('joi');
const { programSchema } = require('./program');

const fellowSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
  },
  nric: {
    type: Number,
    min: [1, 'Please enter valid NRIC without hyphen'],
    required: true,
  },
  phone: {
    type: String,
    minlength: 1,
    maxlength: 15,
    required: true,
  },
  address: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
  },
  discipline: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
  },
  expertise: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
  },
  role: {
    type: String,
    enum: ['fellow', 'trsm', 'ysm-asm', 'staff'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    required: true,
  },
  programs: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
      },
      activities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Activity'
        }
      ]
    },

  ],
  user_details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  created_date: { type: Date, default: Date.now },
});

const Fellow = mongoose.model('Fellow', fellowSchema);

const validateFellow = (fellow) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    nric: Joi.number().min(1).required(),
    phone: Joi.string().min(1).max(15).required(),
    address: Joi.string().min(1).max(255).required(),
    discipline: Joi.string().min(1).max(255).required(),
    expertise: Joi.string().min(1).max(255).required(),
    role: Joi.string().required()
  });

  return schema.validate(fellow);
};

const validateUpdate = (user) => {
  const schema = Joi.object({
    programId: Joi.string().required(),
  });

  return schema.validate(user);
};

exports.Fellow = Fellow;
exports.validate = validateFellow;
exports.validateUpdate = validateUpdate;
exports.fellowSchema = fellowSchema;
