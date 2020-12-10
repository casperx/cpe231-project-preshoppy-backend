const { Router } = require('express');
const eaWrap = require('express-async-handler');

const { Unauthorized } = require('../handler');
const { User } = require('../db');

const router = Router();

router.get(
    '/info/:id',
    eaWrap(async (req, resp) => {
        const { id } = req.params;

        const res = await User.findOne(
            {
                where: { id },
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic']
            }
        );
        if (!res) throw new Unauthorized();

        resp.status(200).json(res);
    })
);

module.exports = router;
