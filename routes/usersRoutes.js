const express = require('express');
const router = express.Router();
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, validate, validateUpdate, userSchema } = require('../models/user');
const { Fellow: FellowSchema, validate: validateFellow, fellowSchema } = require('../models/fellow');
const { Score } = require('../models/score');
const { find } = require('lodash');
const { Mongoose } = require('mongoose');
const { request } = require('express');
const brain = require('../utils/pic')

// LOGIN -- /api/users/login
router.post('/login', async (req, res) => {
  // get data from frontend
  const { email, password } = req.body;
  // check email
  const user = await User.findOne({ email: email })
  if (user) {
    //compare encryted password
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {

      const token = jwt.sign({ _id: user._id }, process.env.SECRET_WEAPON, { expiresIn: '7d' });
      const { _id, email, user_type, fellow_desc } = user;

      if (fellow_desc) {
        const fellow = await User
          .findOne({ _id: user.id })
          .populate('fellow_desc')

        const { name, nric, phone, address, discipline, expertise, role } = fellow.fellow_desc;

        return res.json({
          token,
          user: {
            _id,
            email,
            user_type,
            fellow_desc,
            name,
            nric,
            phone,
            address,
            discipline,
            expertise,
            role
          }
        })
      } else {
        return res.json({
          token,
          user: {
            _id,
            email,
            user_type,
          }
        })
      }


    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } else {
    res.status(401).json({
      error: "User does not exist"
    })
  }

});


// GET /api/users/list
router.get('/lists', async (req, res) => {
  const user = await User.find().select('-password').sort({ created_date: -1 })
  res.send(user)
})


router.get('/piclists', async (req, res) => {
  const pic = await User.find({ user_type: 'secretariat' })
  const options = await brain.remapPIC(pic)
  res.send(options)
})

//GET /api/user/count
router.get('/count', async (req, res) => {
  User.count({}, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      res.json(result)
    }
  })
})

router.get('/byfellow', async (req, res) => {
  var query = { user_type: "fellow" };
  const user = await User.find(query).select('-password');
  res.send(user);
})

router.get('/chart', async (req, res) => {
  const Admin = await User.where({ user_type: "admin" }).countDocuments();
  const Fellow = await User.where({ user_type: "fellow" }).countDocuments();
  const Secretariat = await User.where({ user_type: "secretariat" }).countDocuments();

  res.json({
    label: ["Admin", "Secretariat", "Fellow"],
    data: [Admin, Secretariat, Fellow]
  })
})

router.get('/view/:userID', async (req, res) => {

  const { userID } = req.params;
  const user = await User.findById(userID).select('-password');
  if (!user) return res.status(404).send('No user with given ID was found.');

  res.send(user)
})

// GET /api/users/list/:id - details of users with fellow info
router.get('/viewdetails/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'fellow_desc',
      populate: {
        path: 'programs',
        populate: {
          path: '_id'
        }
      },
    })
    .select('-password');
  if (!user) return res.status(404).send('No user with given ID was found.');
  res.send(user);
});

// POST - /api/users/createfellow

router.post('/createfellow', async (req, res) => {

  try {
    let fellow = await FellowSchema.findOne({ nric: req.body.nric });
    if (fellow) return res.status(400).send('fellow already registered.');

    fellow = new FellowSchema(
      _.pick(req.body, [
        'name',
        'nric',
        'phone',
        'address',
        'discipline',
        'expertise',
        'role',
        'status'
      ])
    );

    await fellow.save();

    let user = new User({
      email: req.body.email,
      password: req.body.password,
      user_type: "fellow",
      fellow_desc: fellow._id
    })
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    let score = new Score({ "fellow_id": fellow._id, "score": 0 });
    await score.save();

    res.send(fellow);

  } catch (ex) {
    res.status(500).send(ex.message);
  }
})

// POST /api/user/register
router.post('/register', async (req, res) => {
  // check if request is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // check user if exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    //create new user
    user = new User(_.pick(req.body, ['email', 'password', 'user_type']));

    // encrypt user password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    //save new user
    await user.save();

    res.send(user);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

// PUT /api/users/assign/:id - update to attach user with fellow id
router.patch('/assign/:id', async (req, res) => {
  try {
    // check if request is valid
    const { error } = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send('User already exist.');

    user.fellow_desc = req.body.fellowId;

    user.save();

    res.send(user);
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

// DEL /api/users/delete/:id
router.delete('/delete/:id', async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user) return res.status(404).send('No user with given ID was found.');

  res.send(user);
});


module.exports = router;
