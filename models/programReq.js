const mongoose = require('mongoose');
const Joi = require('joi');

const ProgramReqSchema = mongoose.Schema({
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
    },
    activity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity"
    },
    fellow_desc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fellow"
    },
    created_date: { type: Date, default: Date.now }
});

const ProgramReq = mongoose.model('ProgramReq', ProgramReqSchema);

const validateProgramReq = (program) => {
    const schema = Joi.object({
        program_id: Joi.string().required(),
        activity_id: Joi.string().required(),
        fellow_desc: Joi.string().required(),
    });

    return schema.validate(program);
};

exports.ProgramReq = ProgramReq;
exports.ProgramReqSchema = ProgramReqSchema;
exports.validate = validateProgramReq;