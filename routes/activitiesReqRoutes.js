const express = require('express');
const router = express.Router();
const _ = require('lodash');
const myBrain = require('../utils/myBrain')
const { ActivityReq, validate } = require('../models/activityReq');
const { Program } = require('../models/program')
const { Fellow } = require('../models/fellow')
const { Score } = require('../models/score')
const { Activity } = require('../models/activity')

// POST create a new request
router.post('/new', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { fellow_desc } = req.body
  const checkFellow = await Fellow.findById(fellow_desc)
  if (!checkFellow) return res.status(404).send('Fellow not found')

  try {
    activity = new ActivityReq(
      _.pick(req.body, ['activity_id', 'program_id', 'fellow_desc'])
    );

    await activity.save();

    res.send(activity);

  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

router.post('/batchcreate/:fellowId/:programId', async (req, res) => {

  const { fellowId, programId } = req.params;
  const { activities } = req.body;

  const checkFellowId = await Fellow.findById(fellowId);
  if (!checkFellowId) return res.status(400).send('No fellow with given ID was found.');

  const checkProgramId = await Program.findById(programId);
  if (!checkProgramId) return res.status(400).send('No program with given ID was found.');

  if (!activities) return res.status(400).send('Invalid activities list');

  const newActivities = await myBrain.remapBatchActivity(fellowId, programId, activities);

  const activity = await ActivityReq.insertMany(newActivities);

  res.send(activity);

});

// GET activity request lists
router.get('/lists', async (req, res) => {

  const activity = await ActivityReq.find()
    .populate('activity_id', 'activity_type')
    .populate('fellow_desc', 'name')
    .populate('program_id', 'topic');

  res.send(activity);
})

// cancel request - by fellow

router.delete('/delete/:id', async (req, res) => {

  const { id } = req.params;

  //check a activity
  const checkId = await ActivityReq.findById(id);
  if (!checkId) return

  const activity = await ActivityReq.findByIdAndDelete(id);

  res.send(activity);
})

// GET activity request lists by fellow_id
router.get('/fellow/:id', async (req, res) => {

  const { id } = req.params;

  const activity = await ActivityReq.find({ "fellow_desc": id })
    .populate('activity_id', 'activity_type')
    .populate('fellow_desc', 'name')
    .populate('program_id', 'topic');

  res.send(activity);

});

//PUT --> approve activities
router.put('/approve/:fellowId', async (req, res) => {

  const { fellowId } = req.params;
  const { activityId, programId, requestId } = req.body;

  // TRUE -- get latest document
  const options = { new: true };

  //check the body requests
  if (!fellowId) return res.status(400).send('Invalid Fellow Id');
  if (!programId) return res.status(400).send('Invalid Program Id');
  if (!requestId) return res.status(400).send('Invalid Request Id');

  const checkProgramId = await Program.findById(programId);
  if (!checkProgramId) return res.status(404).send('No program with given ID was found.');

  const checkFellowId = await Fellow.findById(fellowId);
  if (!checkFellowId) return res.status(404).send('No fellow with given ID was found.');

  const checkActivity = await Activity.findById(activityId);
  if (!checkActivity) return res.status(404).send('No activity with given ID was found.');

  //push score into score's collection

  const filter = { fellow_id: fellowId };

  const activity = await Activity.findById(activityId);
  const { score } = activity;

  const fellowScore = await Score.findOne(filter);
  const currentScore = fellowScore.score;

  let totalScore = currentScore + score;

  const update = { score: totalScore }

  //update score

  await Score.findOneAndUpdate(filter, update, options);

  //push activities
  const fellow = await Fellow.findOneAndUpdate(
    { _id: fellowId, 'programs._id': programId }, {
    $push:
      { 'programs.$.activities': activityId }
  }, options
  );

  //delete request
  const removeRequest = await ActivityReq.findByIdAndDelete(requestId);

  res.send(removeRequest);

})


module.exports = router;
