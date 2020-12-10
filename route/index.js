const { Router } = require('express');
const router = Router();

const event = require('./event');
const auth = require('./auth');
const user = require('./user');
const transaction = require('./transaction');

router.use('/event', event);
router.use('/auth', auth);
router.use('/user', user);
router.use('/transaction', transaction);

module.exports = router;
