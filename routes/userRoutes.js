const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

router.delete('/:userId', userController.user_delete);

module.exports = router;