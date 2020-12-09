const path = require('path');
const { Router } = require('express');
const eaWrap = require('express-async-handler');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');

const { BadRequest, Unauthorized } = require('../handler');
const { User } = require('../db');
const { upload, uploadExtChecker, uploadPath } = require('../upload');

const router = Router();

/* event pic path generator */
const profilePicPath = (fileName) => path.join(uploadPath, 'profile_pic', fileName);

const uploadPicExtsOpts = {
    allowedExts: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']
};

router.post(
    '/create',
    eaWrap(async (req, resp) => {
        if (!req.body || !req.files) throw new BadRequest('required field is missing');

        const { email, password, firstName, lastName, tel } = req.body;
        const { profilePic } = req.files;

        if (!email || !password || !firstName || !lastName || !tel)
            throw new BadRequest('required field is missing');

        /* upload profile picture */
        const dotFileExt = uploadExtChecker(profilePic.name, uploadPicExtsOpts);
        if (!dotFileExt) throw new BadRequest('file extension is not allowed');

        const profilePicFileName = uuid() + dotFileExt;
        await upload(profilePic, profilePicPath(profilePicFileName));

        const hasher = crypto.createHash('SHA3-512');
        const hashedPassword = hasher.update(password).digest('hex');
        await User.create(
            {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                tel,
                profilePic: profilePicFileName
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

        resp.sendStatus(200);
    })
);

module.exports = router;
