const fs =require('fs');
const path = require('path');
const crypto = require('crypto');
const { Router } = require('express');
const eaWrap = require('express-async-handler');
const { v4: uuid } = require('uuid');

const { BadRequest, NotFound } = require('../handler');
const { User } = require('../db');
const { upload, uploadExtChecker, uploadPath } = require('../upload');

/* profile pic path generator */
const profilePicPath = (fileName) => path.join(uploadPath, 'profile_pic', fileName);

const uploadPicExtsOpts = {
    allowedExts: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']
};

const router = Router();

router.get(
    '/info/:id',
    eaWrap(async (req, resp) => {
        const { id } = req.params;

        const res = await User.findOne(
            {
                where: { id },
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'tel']
            }
        );
        if (!res) throw new NotFound();

        resp.status(200).json(res);
    })
);

const userEditableFields = [
    'email',
    'firstName',
    'lastName',
    'tel'
];

router.post(
    '/edit/:id',
    eaWrap(async (req, resp) => {
        const { id: rawId } = req.params;
        const rawBody = req.body;

        const id = parseInt(rawId);

        /* filter only allow field */
        const updateBody = {};

        if (req.files && req.files.profilePic) {
            const { profilePic } = req.files;

            /* upload profile picture */
            const dotFileExt = uploadExtChecker(profilePic.name, uploadPicExtsOpts);
            if (!dotFileExt) throw new BadRequest('file extension is not allowed');

            const oldProfile = await User.findOne(
                {
                    where: { id },
                    attributes: ['profilePic']
                }
            );

            if (oldProfile.profilePic)
                try {
                    fs.unlinkSync(profilePicPath(oldProfile.profilePic));
                } catch (e) {}

            const profilePicFileName = uuid() + dotFileExt;
            await upload(profilePic, profilePicPath(profilePicFileName));

            updateBody.profilePic = profilePicFileName;
        }

        for (const field of userEditableFields)
            if (field in rawBody) updateBody[field] = rawBody[field];

        if (Object.keys(updateBody).length === 0)
            throw new BadRequest('empty edits');

        /* update row */
        const [affectedRow] = await User.update(
            updateBody,
            {
                where: { id }
            }
        );
        if (affectedRow === 0) throw new BadRequest('nothing changed');

        resp.sendStatus(200);
    })
);

const sha3 = (str) => crypto.createHash('SHA3-512').update(str).digest('hex');

router.post(
    '/editPassword/:id',
    eaWrap(async (req, resp) => {
        const { id: rawId } = req.params;
        const { oldPassword, newPassword } = req.body;

        const id = parseInt(rawId);

        /* update row */
        const [affectedRow] = await User.update(
            {
                password: sha3(newPassword)
            },
            {
                where: { 
                    id, 
                    password: sha3(oldPassword)
                }
            }
        );
        if (affectedRow === 0) throw new BadRequest();

        resp.sendStatus(200);
    })
);

module.exports = router;
