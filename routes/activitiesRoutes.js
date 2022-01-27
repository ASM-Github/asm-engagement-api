const express = require('express');
const router = express.Router();
const _ = require('lodash');
const brain = require('../utils/renameArray')

const { Activity, validate } = require('../models/activity');
const { Program } = require('../models/program');

// GET /api/activities/lists
router.get('/lists', async (req, res) => {
  const activities = await Activity.find().sort({ created_date: -1 })
  res.send(activities);
});

router.get('/lists/options/', async (req, res) => {
  const activities = await Activity.find().sort('name')
    .select('_id activity_type');
  const newActivities = brain.renameArrayKey(activities)
  res.send(newActivities);
});

//GET /api/activtities/count
router.get('/count', async (req, res) => {
  Activity.count({}, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      res.json(result)
    }
  })
})

// POST /api/activities/create
router.post('/create', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let activity = new Activity(
      _.pick(req.body, [
        'activity_type',
        'description',
        'score',
        'hours'
      ])
    );
    activity = await activity.save();
    res.send(activity);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

// GET /api/activities/:id
router.get('/:id', async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) return res.status(404).send('No activity with given ID was found.');

  res.send(activity);
});

router.put('/update/:activityId', async (req, res) => {

  const { activityId } = req.params;
  const { activity_type, score, description } = req.body;
  const update = { activity_type, score, description };

  const activity = await Activity.findByIdAndUpdate(activityId, update, { new: true });

  res.send(activity);

})

// DEL /api/programs/:id
// router.delete('/:id', async (req, res) => {
//   const activity = await Activity.findByIdAndRemove(req.params.id);

//   if (!activity) return res.status(404).send('No activity with given ID was found.');

//   res.send(activity);
// });

router.get('/count', async (req, res) => {
  const activities = await Activity.find().sort('name');
  res.send(activities);
});

//activity options by fellow

router.get('/options/:programId', async (req, res) => {

  const { programId } = req.params;

  const program = await Program.findById(programId);
  res.send(program);
})

module.exports = router;
