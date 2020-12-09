const fs = require('fs');
const path = require('path');
const eaWrap = require('express-async-handler');
const { Router } = require('express');
const { v4: uuid } = require('uuid');

const { BadRequest, NotFound } = require('../handler');
const { Event } = require('../db');
const { upload, uploadExtChecker, uploadPath } = require('../upload');

const router = Router();

/* event pic path generator */
const eventPicPath = (fileName) => path.join(uploadPath, 'event_pic', fileName);

router.get(
    '/list',
    eaWrap(async (req, resp) => {
        const res = await Event.findAll();
        resp.json(res);
    })
);

router.get(
    '/get/:id',
    eaWrap(async (req, resp) => {
        const { id: rawId } = req.params;

        const id = parseInt(rawId);
        const row = await Event.findOne(
            {
                where: { id }
            }
        );
        if (!row) throw new NotFound('entity not found');

        resp.json(row);
    })
);

const uploadPicExtsOpts = {
    allowedExts: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']
};

/* YYYY-MM-DD HH:MM:SS */
const sqlDateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;

router.post(
    '/add',
    eaWrap(async (req, resp) => {
        if (!req.body || !req.files)
            throw new BadRequest('required field is missing');

        /* check required field */
        const { name, detail, startDateTime, endDateTime, location, contact } = req.body;
        const { eventPic } = req.files;

        if (
            !name ||
            detail === undefined ||
            !startDateTime ||
            !endDateTime ||
            !location ||
            !contact ||
            !eventPic
        ) throw new BadRequest('required field is missing');

        const cleanName = name.trim(),
            cleanStartDateTime = startDateTime.trim(),
            cleanEndDateTime = endDateTime.trim(),
            cleanLocation = location.trim(),
            cleanContact = contact.trim();
        if (
            !cleanName ||
            !cleanLocation ||
            !cleanContact ||
            !cleanStartDateTime.match(sqlDateTimePattern) ||
            !cleanEndDateTime.match(sqlDateTimePattern)
        ) throw new BadRequest('required field is not correct');

        /* upload event picture */
        const dotFileExt = uploadExtChecker(eventPic.name, uploadPicExtsOpts);
        if (!dotFileExt) throw new BadRequest('file extension is not allowed');

        const eventPicFileName = uuid() + dotFileExt;
        await upload(eventPic, eventPicPath(eventPicFileName));

        /* create row */
        await Event.create(
            {
                name: cleanName,
                detail,
                startDateTime: cleanStartDateTime,
                endDateTime: cleanEndDateTime,
                location: cleanLocation,
                contact: cleanContact,
                eventPic: eventPicFileName
            }
        );

        resp.sendStatus(200);
    })
);

const eventEditableFields = [
    'name',
    'detail',
    'startDateTime',
    'endDateTime',
    'location',
    'contact'
];

router.post(
    '/edit/:id',
    eaWrap(async (req, resp) => {
        const { id: rawId } = req.params;
        const rawBody = req.body;

        const id = parseInt(rawId);

        /* filter only allow field */
        const updateBody = {};
        for (const field of eventEditableFields)
            if (field in rawBody) updateBody[field] = rawBody[field];

        if (Object.keys(updateBody).length === 0)
            throw new BadRequest('empty edits');

        /* update row */
        const [affectedRow] = await Event.update(
            updateBody,
            {
                where: { id }
            }
        );
        if (affectedRow === 0) throw new BadRequest();

        resp.sendStatus(200);
    })
);

router.post(
    '/delete/:id',
    eaWrap(async (req, resp) => {
        const { id: rawId } = req.params;

        const id = parseInt(rawId);
        /* find row */
        const res = await Event.findOne(
            {
                where: { id },
                attributes: ['id', 'eventPic']
            }
        );
        if (!res) throw new NotFound();

        /* delete event pic */
        fs.unlinkSync(eventPicPath(res.eventPic));
        /* delete row */
        await res.destroy();

        resp.sendStatus(200);
    })
);

module.exports = router;
