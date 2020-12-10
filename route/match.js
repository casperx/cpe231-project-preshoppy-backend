const { Router } = require('express');
const eaWrap = require('express-async-handler');
const Sequelize = require('sequelize');

const { BadRequest, NotFound } = require('../handler');
const { Match, MatchQueue } = require('../db');

const router = Router();

router.post(
    '/register/:type',
    eaWrap(async (req, resp) => {
        const { type } = req.params;
        let { userId, eventId } = req.body;
        userId = parseInt(userId);
        eventId = parseInt(eventId);

        if (type === 'seller') {
            const existsRow = await MatchQueue.findOne(
                {
                    where: { event: eventId, user: userId, type: 1 }
                }
            );
            if (existsRow)
                throw new BadRequest('already queue');

            await MatchQueue.create(
                {
                    event: eventId,
                    user: userId,
                    type: 1
                }
            );
            resp.sendStatus(200);
        } else if (type === 'buyer') {
            const existsMatch = await Match.findOne(
                {
                    where: { event: eventId, buyer: userId },
                    attributes: ['buyer', 'seller', 'event']
                }
            );
            if (existsMatch) {
                return resp.json(
                    {
                        buyerId: existsMatch.buyer,
                        sellerId: existsMatch.seller,
                        eventId: existsMatch.event,
                    }
                );
            }

            const existsSeller = await MatchQueue.findOne(
                {
                    where: { event: eventId, type: 1 },
                    order: [[
                        Sequelize.fn('RAND') 
                    ]]
                }
            );
            if (!existsSeller)
                throw new NotFound('no seller registered for that event');

            await Match.create(
                {
                    buyerId: userId,
                    sellerId: existsSeller.user,
                    eventId: eventId
                }
            );
            resp.status(200).json(
                {
                    buyerId: userId,
                    sellerId: existsSeller.user,
                    eventId: eventId
                }
            );
        } else {
            throw new BadRequest('invalid type');
        }
    })
);

module.exports = router;
