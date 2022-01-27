const express = require('express');
const router = express.Router();
const _ = require('lodash');

const { Score } = require('../models/score');
// const { Fellow } = require('../models/fellow');

router.get('/lists', async (req, res) => {

    const score = await Score.find().populate({ path: 'fellow_id', select: 'name role' });
    res.send(score);
});

//testing only
router.post('/create', async (req, res) => {

    const { fellow_id } = req.body;

    const doc = await Score.findOne();
    //convert to String
    const idString = doc.fellow_id.toString();

    const filter = { fellow_id: idString };
    //get current score
    const fellow = await Score.findOne(filter);
    const currentScore = fellow.score;
    let totalScore = currentScore + 1;

    const update = { score: totalScore }

    //update score
    const updateScore = await Score.findOneAndUpdate(filter, update, {
        new: true
    });

    res.send(updateScore);
});

router.get('/:fellow_id', async (req, res) => {

    const { fellow_id } = req.params;
    const score = await Score.findOne({ fellow_id });
    res.send(score);
})



module.exports = router;
