const mongoose = require('mongoose');
const Joi = require('joi');

const activityReqSchema = mongoose.Schema({

    fellow_desc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fellow"
    },
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
    },
    activity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity"
    },
    created_date: { type: Date, default: Date.now },

});

const ActivityReq = mongoose.model('ActivityReq', activityReqSchema);

const validateActivityReq = (activity) => {
    const schema = Joi.object({
        activity_id: Joi.required(),
        program_id: Joi.required(),
        fellow_desc: Joi.required(),
    });

    return schema.validate(activity);
};

exports.ActivityReq = ActivityReq;
exports.validate = validateActivityReq;
exports.activityReqSchema = activityReqSchema;
