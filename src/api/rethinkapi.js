const express = require('express');
const r = require('../utils/db');
const moment = require('moment');

const app = express();
const server = app.listen(1337);
const io = require('socket.io').listen(server);

const connectionArray = [];

const sleep = (time) => { return new Promise(resolve => setTimeout(resolve, time)); }

let globRespArray = [];

function always() {
    if (connectionArray.length) {
        sleep(1000)
            .then(async () => {
                const feed = {
                    totalReqCount: 0,
                    totalDistinctReq: 0,
                    averageResTime: 0,
                    respArray: globRespArray,

                };
                let success = 0;

                // getting total request realtime
                try {
                    feed.totalReqCount = await r
                        .table('logs')
                        .between(moment.utc().subtract(1, 'hours').toDate(), moment.utc().toDate(), { index: 'time' })
                        .count()
                        .run();
                } catch (err) {
                    console.log('error is ', err);
                }

                // getting total distinct requst loglevel and their respective counts
                try {
                    feed.totalDistinctReq = await r
                        .table('logs')
                        .between(moment.utc().subtract(1, 'hours').toDate(), moment.utc().toDate(), { index: 'time' })
                        .group('level')
                        .count()
                        .run();
                } catch (err) {
                    console.log('error is ', err);
                }

                // getting average response time
                try {
                    feed.averageResTime = await r
                        .table('logs')
                        .between(moment.utc().subtract(1, 'hours').toDate(), moment.utc().toDate(), { index: 'time' })
                        .avg(r.row('ms').coerceTo('NUMBER'))
                        .run();
                } catch (err) {
                    console.log('error is ', err);
                }

                // getting pie chart values for sucess and non-sucess responses
                try {
                    success = await r
                        .table('logs')
                        .between(moment.utc().subtract(1, 'hours').toDate(), moment.utc().toDate(), { index: 'time' })
                        .pluck('res')
                        .filter(r.row('res')('statusCode').le(299))
                        .count()
                        .run();
                    feed.sucessStatus = [['success-request', success], ['other-request', parseInt(feed.totalReqCount, 10) - parseInt(success, 10)]];
                } catch (err) {
                    console.log('error is ', err);
                }

                // getting the response time
                try {
                    let resptime = await r
                        .table('logs')
                        .limit(5)
                        .avg(r.row('ms').coerceTo('NUMBER'))
                        .run();
                    const timeNow = moment.utc().format('YYYY-MM-DD  h:mm');
                    const dataNow = {};
                    dataNow[timeNow] = parseFloat(resptime) + Math.floor((Math.random() * 10) + 1);
                    globRespArray.push(dataNow);
                    if ((globRespArray.length) > 100) {
                        globRespArray.shift();
                    }
                    // console.log(globRespArray);
                } catch (err) {
                    console.log('error is ', err);
                }

                connectionArray.forEach((tmpSocket) => {
                    tmpSocket.volatile.emit('broadcast', { description: `${JSON.stringify(feed)}` });
                });
                always();
            }).catch((err) => {
                console.log('Sleep function failed', err);
            });
    }
}

io
    .on('connection', (socket) => {
        console.log('a user connected');

        connectionArray.push(socket);

        if (connectionArray.length) {
            always();
        }
        // push some test messages
        // io.sockets.emit('broadcast', { description: Date() + 'is the date'});

        // Whenever someone disconnects this piece of code executed
        socket.on('disconnect', () => {
            const socketIndex = connectionArray.indexOf(socket);
            if (socketIndex >= 0) {
                connectionArray.splice(socketIndex, 1);
            }
            console.log('A user disconnected');
        });
    });


exports.logs = async (req, res) => {
    /**
     * Return the logs in an orderly fashion
     * @param {String} fromdate  The From date of logs
     * @param {String} todate   The to date of logs
     * @param {Int} limit The total limit of logs
     * @noparm return 10 records
     */

    let value = '';

    if (req.query.fromdate && req.query.todate) {
        const min = moment.utc(req.query.fromdate, moment.ISO_8601);
        const max = moment.utc(req.query.todate, moment.ISO_8601);
        console.log(min.toDate(), max.toDate());
        try {
            value = await r
                .table('logs')
                .between(min.toDate(), max.toDate(), { index: 'time' })
                .limit(10)
                .run();
        } catch (err) {
            console.log('error is ', err);
        }
    } else {
        value = await r
            .table('logs')
            .limit(10)
            .run();
    }
    const val = JSON.stringify(value);
    res.end(`${val}`);
};
