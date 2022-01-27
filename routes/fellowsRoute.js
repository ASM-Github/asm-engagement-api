const { response } = require('express');
const express = require('express');
const { number } = require('joi');
const { find } = require('lodash');
const router = express.Router();
const _ = require('lodash');
const { Fellow, validate, validateUpdate } = require('../models/fellow');
const { Score } = require('../models/score');
const { Program } = require('../models/program')
const { User } = require('../models/user');
const brain = require('../utils/calculateScores')
const arrayBrain = require('../utils/renameArray')


// GET /api/fellow/lists
router.get('/lists', async (req, res) => {
  const fellow = await Fellow.find().sort({ created_date: -1 })
  res.send(fellow)
})


//GET /api/fellow/count
router.get('/count', async (req, res) => {
  Fellow.count({}, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      res.json(result)
    }
  })
})

router.get('/participants', async (req, res) => {

  const fellow = await Fellow.find().select('name');

  const participants = arrayBrain.remapParticipants(fellow);

  res.send(participants);

})


router.get('/score', async (req, res) => {

  const fellow = await Fellow.find().select('name role programs')
    .populate({
      path: 'programs',
      select: 'users',
      populate: {
        path: 'users.activities',
        select: 'score',
        match: '_id: '
      }
    });

  const fellow_score = await fellow.map(item => {
    const { role, name, programs, _id } = item;

    const role_score = brain.calculateScore(role)
    const programs_score = role_score + programs.length;
    return {
      name,
      programs,
      _id,
      programs_score
    }
  })


  res.send(fellow)
})

router.get('/top5score', async (req, res) => {

  const fellows = await Fellow.find().populate({
    path: 'programs',
    populate: { path: 'activities' }
  })

  const score = fellows.map(fellow => {
    const { programs, role, _id, name } = fellow;
    const score = brain.calculateScore(programs, role);
    return { _id, name, score }
  })

  res.send(score);
})

// GET - /api/fellow/selectoptions
router.get('/selectoptions', async (req, res) => {
  const fellow = await Fellow.find().select('name');
  res.send(fellow);
});


//get score by fellow Id
router.get('/score', async (req, res) => {
  const { fellowId } = req.body;

  const fellow = await Fellow.findById(fellowId);

  res.send(fellow);
})

// GET - /api/fellows/score/fid
router.get('/score/:fid', async (req, res) => {

  const { fid } = req.params;

  const fellow = await Fellow.findById(fid).populate({
    path: 'programs',
    populate: { path: 'activities' }
  })

  const { role, programs, _id } = fellow;

  const score = brain.calculateScore(programs, role)

  res.json({ _id, score });
});

// programs selection
router.get('/programs-select/:id', async (req, res) => {

  const { id } = req.params;
  // find program by fellowId
  const fellow = await Fellow.findById(id);
  // compare unique id
  const select = await Program.find({
    "_id": { "$nin": fellow.programs }
  }).select('_id topic');
  // OK!

  const remap = await arrayBrain.Program4Select(select)

  res.send(remap);
});

// GET - /api/fellows/score/fid
router.get('/programs/:fellowId', async (req, res) => {

  const { fellowId } = req.params;

  const fellow = await Fellow.findById(fellowId)
    .populate({
      path: 'programs._id',
      select: 'topic start_date end_date',
      sort: { created_date: -1 },
    })
    .populate({
      path: 'programs.activities',
      select: 'activity_type'
    });

  const { programs, _id } = fellow;

  res.json({
    _id,
    programs,
  })

});


// GET - /api/fellows/view:id
router.get('view/:id', async (req, res) => {
  const id = req.params.id;
  // find fellow by id
  const checkFellow = await Fellow.findById(id);
  res.send(checkFellow);
});
// GET - /api/fellow/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  //find program id 
  const checkFellow = await Fellow.findById(id);
  if (!checkFellow) return res.status(400).send('Fellow does not exist');

  const fellow = await Fellow.findById(id);
  res.send(fellow);
});

// POST /api/fellows/create - create new fellow user
router.post('/create', async (req, res) => {
  // check if request is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let fellow = await Fellow.findOne({ nric: req.body.nric });
    if (fellow) return res.status(400).send('fellow already registered.');

    fellow = new Fellow(
      _.pick(req.body, [
        'name',
        'nric',
        'phone',
        'address',
        'discipline',
        'expertise',

      ])
    );

    fellow = await fellow.save();

    res.send(fellow);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

router.post('/update/:id', async (req, res) => {
  const { id } = req.params
  const { name, nric, phone, address, discipline, expertise } = req.body
  const update = await Fellow.findByIdAndUpdate(id,
    {
      name,
      nric,
      phone,
      address,
      discipline,
      expertise
    }, function (ex) {
      if (ex) {
        res.status(400).send(error)
      }
      else {
        res.status(200).send("Profile updated successfully")
      }
    }
  )
})

// PATCH /api/fellows/assign/:id - update fellow user
router.patch('/assign/:id', async (req, res) => {
  try {
    const { error } = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const fellow = await Fellow.findById(req.params.id);
    if (!fellow) return res.status(400).send('Fellow already exist.');

    // fellow.programs = req.body.programId;
    fellow.programs.push({
      _id: req.body.programId,
    });

    fellow.save();

    res.send(fellow);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

// DEL /api/fellows/delete/:id
router.delete('/delete/:id', async (req, res) => {
  const fellow = await Fellow.findByIdAndRemove(req.params.id);

  if (!fellow)
    return res.status(404).send('No fellow with given ID was found.');

  res.send(fellow);
});

module.exports = router;
