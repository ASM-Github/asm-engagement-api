const mongoose = require('mongoose');
const Joi = require('joi');
const { activitySchema } = require('./activity');

const programSchema = mongoose.Schema({
  topic: {
    type: String,
    minlength: 1,
    maxlength: 150,
    required: true,
  },
  description: {
    type: String,
    minlength: 1,
    maxlength: 300,
  },
  start_date: {
    type: Date,
    default: null,
  },
  end_date: {
    type: Date,
    default: null,
  },
  pic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  users: [

    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fellow"
    }

  ],
  created_date: { type: Date, default: Date.now },
});

const Program = mongoose.model('Program', programSchema);

const validateProgram = (program) => {
  const schema = Joi.object({
    topic: Joi.string().min(1).max(150).required(),
    description: Joi.string().max(300).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    pic: Joi.string().required(),
    users: Joi.array()
  });

  return schema.validate(program);
};

const validateProgramUpdate = (program) => {
  const schema = Joi.object({
    activityId: Joi.string().required(),
  });

  return schema.validate(program);
};

exports.Program = Program;
exports.programSchema = programSchema;
exports.validate = validateProgram;
exports.validateUpdate = validateProgramUpdate;
