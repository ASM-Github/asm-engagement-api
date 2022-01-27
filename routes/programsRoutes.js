const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { Fellow } = require('../models/fellow');
const { Activity } = require('../models/activity');
const { Score } = require('../models/score');
const { User } = require('../models/user');
const { Program, validate, validateUpdate } = require('../models/program');
const { find } = require('lodash');
const brain = require('../utils/renameArray')

// GET /api/programs/
router.get('/lists', async (req, res) => {
  const program = await Program.find().sort({ created_date: -1 }).populate('pic', 'email')
  res.send(program)
});


router.get('/programslist', async (req, res) => {

  const listprogram = await Program
    .find()
    .select('-created_date')
    .populate('participant', 'name')
    .populate('pic', 'name')
  res.send(listprogram);

})

//GET /api/programs/count
router.get('/count', async (req, res) => {
  Program.count({}, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      res.json(result)
    }
  })
})

router.get('/selectoptions', async (req, res) => {

  const options = await Program.find().select('topic')
  const newOpt = await brain.NewProgramOptions(options)
  res.send(newOpt)
})

// GET /api/programs/:id
router.get('delete/:id', async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program)
    return res.status(404).send('No program with given ID was found.');

  res.send(program);
});

// POST /api/programs/create
router.post('/create', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const program = new Program(
    _.pick(req.body, [
      'topic',
      'description',
      'start_date',
      'end_date',
      'pic',
      'users'
    ])
  )

  const saveProgram = await program.save()

  const DEFAULT_PROGRAM_SCORE = 1;

  const { users } = saveProgram;

  await users.map(async (fellowId) => {

    try {
      const fellow = await Fellow.findById(fellowId);
      // programs._id is current program id
      fellow.programs.push(program._id)
      await fellow.save();

      const filter = { fellow_id: fellowId };
      //get current score
      const fellowScore = await Score.findOne(filter);
      const currentScore = fellowScore.score;
      let totalScore = currentScore + DEFAULT_PROGRAM_SCORE;

      const update = { score: totalScore }

      //update score
      await Score.findOneAndUpdate(filter, update, {
        new: true
      });

    } catch (ex) {
      res.status(500).send(ex.message);
      console.log(ex)
    }
  });

  res.send(saveProgram)

});

router.get('/:id', async (req, res) => {
  const program = await Program.findById(req.params.id)
    .populate({ path: 'users', select: '-programs' })
    .populate({ path: 'pic', select: 'email' });
  if (!program)
    return res.status(404).send('No program with given ID was found.');

  res.send(program);
});

router.post("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { topic, description, start_date, end_date } = req.body;
  const update = await Program.findByIdAndUpdate(
    id,
    {
      topic,
      description,
      start_date,
      end_date,
    },
    function (ex) {
      if (ex) {
        res.status(400).send(error);
      } else {
        res.status(200).send("Program updated successfully");
      }
    }
  );
});

// PUT /api/programs/:id
router.put('assign/:id', async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // check if program id is valid
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(400).send('Invalid program ID.');
    // check if activity id is valid
    const activity = await Activity.findById(req.body.activityId);
    if (!activity) return res.status(400).send('Invalid activity ID.');

    // check if the activity record is exist
    const isExist = program.activities.map((list) => list._id);
    if (isExist.includes(req.body.activityId)) {
      return res.status(400).send('Duplicate activity.');
    }

    // pre-push data to an activity object format
    program.activities.push({
      _id: activity._id,
      description: activity.description,
      activity_type: activity.activity_type,
      hours: activity.hours,
    });

    // save data to db
    await program.save();
    res.send(program);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

// PUT /api/programs/remove/:id
router.put('/remove/:id', async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const program = await Program.findById(req.params.id);
  const activity = program.activities.id({ _id: req.body.activityId });
  if (!activity) return res.status(400).send('Invalid activity ID.');
  activity.remove();
  await program.save();

  res.send(program);
});

// DEL /api/programs/:id
router.delete('/:id', async (req, res) => {
  const program = await Program.findByIdAndRemove(req.params.id);

  if (!program)
    return res.status(404).send('No program with given ID was found.');

  res.send(program);
});

module.exports = router;

// POST /api/programs/create
// router.post('/create', async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   const activity = await Activity.findById(req.body.activityId);
//   if (!activity) return res.status(400).send('Activity already exist.');

//   const user = await User.findById(req.body.userId);
//   if (!user) return res.status(400).send('No registered user was found.');

//   try {
//     let program = new Program({
//       topic: req.body.topic,
//       activities: {
//         _id: activity._id,
//         name: activity.name,
//         activity_type: activity.activity_type,
//         hours: activity.hours,
//       },
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         discipline: user.discipline,
//         gender: user.gender,
//         isAdmin: user.isAdmin,
//         password: user.password,
//         nric: user.nric,
//       },
//       hours: req.body.hours,
//     });

//     program = await program.save();

//     res.send(program);
//   } catch (ex) {
//     res.status(500).send(ex.message);
//   }
// });

// PUT /api/programs/:id
// router.patch('/:id', async (req, res) => {
//   const { error } = validateUpdate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   try {
//     // check if program id is valid
//     const program = await Program.findById(req.params.id);
//     if (!program) return res.status(400).send('Invalid program ID.');
//     // check if activity id is valid
//     const activity = await Activity.findById(req.body.activityId);
//     if (!activity) return res.status(400).send('Invalid activity ID.');

//     // check if the activity record is exist
//     const isExist = program.activities.map((list) => list._id);
//     if (isExist.includes(req.body.activityId)) {
//       return res.status(400).send('Duplicate activity.');
//     }

//     // pre-push data to an activity object format
//     program.activities.push({
//       _id: activity._id,
//       name: activity.name,
//       activity_type: activity.activity_type,
//       hours: activity.hours,
//     });

//     // save data to db
//     await program.save();
//     res.send(program);
//   } catch (ex) {
//     res.status(500).send(ex.message);
//   }
// });
