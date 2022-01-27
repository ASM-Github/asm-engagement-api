const mongoose = require('mongoose');
const Joi = require('joi');

const activitySchema = mongoose.Schema({
  activity_type: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
  },
  description: {
    type: String,
    minlength: 1,
    maxlength: 500,
    required: true,
  },
  score: {
    type: Number,
    min: [1, 'Please enter scores'],
    max: [5, 'Please enter scores'],
    required: true,
  },
  created_date: { type: Date, default: Date.now },
});

const Activity = mongoose.model('Activity', activitySchema);

const validateActivity = (activity) => {
  const schema = Joi.object({
    description: Joi.string().min(1).max(255).required(),
    activity_type: Joi.string().max(200).required(),
    score: Joi.number().min(1).max(5),
  });

  return schema.validate(activity);
};

exports.Activity = Activity;
exports.validate = validateActivity;
exports.activitySchema = activitySchema;
