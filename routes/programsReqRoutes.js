const express = require('express');
const { find } = require('lodash');
const router = express.Router();
const _ = require('lodash');
const { Fellow } = require('../models/fellow');
const { Program } = require('../models/program');
const { Score } = require('../models/score');
const { Activity } = require('../models/activity');


const { ProgramReq, validate } = require('../models/programReq');

// POST create new request
router.post('/new', async (req, res) => {

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const activity = new ProgramReq(
        _.pick(req.body, ['program_id', 'activity_id', 'fellow_desc']));

    await activity.save();

    res.send(activity);
})

// GET program request lists
router.get('/lists', async (req, res) => {

    const program = await ProgramReq.find()
        .populate('program_id', 'topic')
        .populate('activity_id', 'activity_type')
        .populate('fellow_desc', 'name');

    res.send(program);
})

router.get('/fellow/:id', async (req, res) => {

    const { id } = req.params;

    const program = await ProgramReq.find({ "fellow_desc": id })
        .populate('program_id', 'topic')
        .populate('activity_id', 'activity_type')
        .populate('fellow_desc', 'name');

    res.send(program);
})

// cancel request - by fellow
router.delete('/delete/:id', async (req, res) => {

    const { id } = req.params;

    //check the program
    const checkId = await ProgramReq.findById(id);
    if (!checkId) return res.status(404).send('Could find the program')

    const program = await ProgramReq.findByIdAndDelete(id);

    res.send(program);
})

router.put('/approve/:fellowId', async (req, res) => {

    const { fellowId } = req.params;
    const { programId, activityId, requestId } = req.body;

    // TRUE -- get latest document
    const options = { new: true };

    //check all the requests
    if (!programId) return res.status(400).send('Invalid Program Id');
    if (!activityId) return res.status(400).send('Invalid Activity Id');
    if (!requestId) return res.status(400).send('Invalid Request Id');

    const act = await Activity.findById(activityId);

    const filter = { fellow_id: fellowId };
    //get current score
    const FellowScore = await Score.findOne(filter);
    const currentScore = FellowScore.score;
    let totalScore = currentScore + act.score + 1;

    const update = { score: totalScore }

    //update score
    await Score.findOneAndUpdate(filter, update, options);

    const program = await Program.findById(programId);
    program.users.push(fellowId);
    await program.save();

    //push program_Id
    const fellow = await Fellow.findById(fellowId);
    fellow.programs.push(programId);
    await fellow.save();

    //push activity
    const activity = await Fellow.findOneAndUpdate(
        { _id: fellowId, 'programs._id': programId }, {
        $push:
            { 'programs.$.activities': activityId }
    }, options
    );

    //delete request
    const removeRequest = await ProgramReq.findByIdAndRemove(requestId);


    res.send(removeRequest)

})

module.exports = router;

