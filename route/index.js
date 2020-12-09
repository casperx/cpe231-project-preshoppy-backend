const { Router } = require('express');
const router = Router();

const event = require('./event');
const auth = require('./auth');

router.use('/event', event);
router.use('/auth', auth);

module.exports = router;
