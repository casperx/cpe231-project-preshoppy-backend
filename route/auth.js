const { Router } = require('express');
const eaWrap = require('express-async-handler');
const crypto = require('crypto');

const { BadRequest, Unauthorized } = require('../handler');
const { User, UserAddress } = require('../db');

const router = Router();

router.post(
    '/create',
    eaWrap(async (req, resp) => {
        const { email, password } = req.body;

        if (!email || !password)
            throw new BadRequest('required field is missing');

        const cleanEmail = email.trim(),
            cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword)
            throw new BadRequest('required field is empty');

        const emailExists = await User.findOne(
            {
                where: { email: cleanEmail },
                attributes: ['id']
            }
        );

        if (emailExists) throw new BadRequest('email is already used');

        const hasher = crypto.createHash('SHA3-512');
        const hashedPassword = hasher.update(cleanPassword).digest('hex');
        const newUser = await User.create(
            {
                email: cleanEmail,
                password: hashedPassword
            }
        );
        const newAddress = await UserAddress.create(
            {
                name: 'Home',
                address: '123/456 Brooklyn St., Newyork, USA, Zip Code 69696',
                user: newUser.id
            }
        );
        await newUser.update(
            {
                preferredAdress: newAddress.id
            }
        );
        resp.sendStatus(200);
    })
);

router.post(
    '/login',
    eaWrap(async (req, resp) => {
        if (!req.body) throw new BadRequest('required field is missing');

        const { email, password } = req.body;

        if (!email || !password)
            throw new BadRequest('required field is missing');

        const hasher = crypto.createHash('SHA3-512');
        const hashedPassword = hasher.update(password).digest('hex');

        const res = await User.findOne(
            {
                where: { email, password: hashedPassword },
                attributes: ['id']
            }
        );
        if (!res) throw new Unauthorized();

        resp.status(200).json(res);
    })
);

module.exports = router;
