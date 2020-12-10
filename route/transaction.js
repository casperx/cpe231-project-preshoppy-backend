const path = require('path');
const eaWrap = require('express-async-handler');
const { Router } = require('express');
const { v4: uuid } = require('uuid');

const { BadRequest, NotFound } = require('../handler');
const { User, Transaction, TransactionItem } = require('../db');
const { upload, uploadExtChecker, uploadPath } = require('../upload');

/* evidence pic path generator */
const evidencePicPath = (fileName) => path.join(uploadPath, 'evidence_pic', fileName);

const uploadPicExtsOpts = {
    allowedExts: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']
};

const router = Router();

router.post(
    '/create',
    eaWrap(async (req, resp) => {
        const { eventId, buyerId, sellerId } = req.body;

        const buyer = await User.findOne(
            {
                where: { id: buyerId },
                attributes: ['id', 'preferredAdress']
            }
        );
        console.log(buyer);
        if (buyer.preferredAdress === null) throw new Error('please set default address');
        const buyerPreferredAddress = await buyer.getUserAddress(
            {
                attributes: ['address']
            }
        );
        await Transaction.create(
            {
                event: eventId,
                buyer: buyerId,
                seller: sellerId,

                address: buyerPreferredAddress.address,
            }
        );

        resp.sendStatus(200);
    })
);

router.post(
    '/addBulk/:id',
    eaWrap(async (req, resp) => {
        const { id: transactionId } = req.params;
        const items = req.body;

        const transaction = await Transaction.findOne(
            {
                where: { id: transactionId },
                attributes: ['id']
            }
        );
        if (!transaction) throw new NotFound();

        const transactionItems = await Promise.all(
            items.map(
                item => TransactionItem.create(item)
            )
        );
        await transaction.addTransactionItems(transactionItems);

        resp.sendStatus(200);
    })
);

router.post(
    '/setPayment/:id',
    eaWrap(async (req, resp) => {
        if (!req.files) throw new BadRequest('required field is missing');

        const { id: transactionId } = req.params;
        const { evidencePic } = req.files;

        const transaction = await Transaction.findOne(
            {
                where: { id: transactionId },
                attributes: ['id', 'status']
            }
        );
        if (!transaction) throw new NotFound();
        if (transaction.status !== 1) throw new BadRequest('invalid state');

        /* upload evidence picture */
        const dotFileExt = uploadExtChecker(evidencePic.name, uploadPicExtsOpts);
        if (!dotFileExt) throw new BadRequest('file extension is not allowed');

        const evidencePicFileName = uuid() + dotFileExt;
        await upload(evidencePic, evidencePicPath(evidencePicFileName));

        transaction.set(
            {
                status: 2,
                evidencePic: evidencePicFileName
            }
        );
        await transaction.save();
        resp.sendStatus(200);
    })
);

router.post(
    '/setTracking/:id',
    eaWrap(async (req, resp) => {
        const { id: transactionId } = req.params;
        const { tracking } = req.body;

        const transaction = await Transaction.findOne(
            {
                where: { id: transactionId },
                attributes: ['id', 'status']
            }
        );
        if (!transaction) throw new NotFound();
        if (transaction.status !== 2) throw new BadRequest('invalid state');
        transaction.set(
            {
                status: 3,
                tracking
            }
        );
        await transaction.save();
        resp.sendStatus(200);
    })
);

router.post(
    '/setAccept/:id',
    eaWrap(async (req, resp) => {
        const { id: transactionId } = req.params;

        const transaction = await Transaction.findOne(
            {
                where: { id: transactionId },
                attributes: ['id', 'status']
            }
        );
        if (!transaction) throw new NotFound();
        if (transaction.status !== 3) throw new BadRequest('invalid state');
        transaction.set(
            {
                status: 4,
            }
        );
        await transaction.save();
        resp.sendStatus(200);
    })
);

router.get(
    '/get/:id',
    eaWrap(async (req, resp) => {
        const { id: transactionId } = req.params;

        const transaction = await Transaction.findOne(
            {
                where: { id: transactionId },
                attributes: [
                    'id',

                    'timestamp',
                    'status',

                    'evidencePic',
                    'address',
                    'tracking',

                    'buyer',
                    'seller',
                    'event'
                ]
            }
        );
        if (!transaction) throw new NotFound();

        const values = transaction.dataValues;
        const items = await transaction.getTransactionItems(
            {
                attributes: [
                    'name',
                    'detail',
                    'price',

                    'quantity'
                ]
            }
        );
        resp.json(
            {
                ...values,
                items
            }
        );
    })
);

module.exports = router;