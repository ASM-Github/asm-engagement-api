const mongoose = require('mongoose');
const Joi = require('joi');

const ScoreSchema = mongoose.Schema({
    score: {
        type: Number,
    },

    fellow_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fellow"
    },
    created_date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

const validateScore = (score) => {
    const schema = Joi.object({
        fellow_id: Joi.string().required(),
    });
    return schema.validate(score);
};

exports.Score = Score;
exports.ScoreSchema = ScoreSchema;
exports.validate = validateScore;