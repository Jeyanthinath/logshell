const express = require('express');
const r = require('../utils/db');
const moment = require('moment');

const app = express();
const server = app.listen(1337);
const io = require('socket.io').listen(server);

let connectionArray = [];

const sleep = (time) => { return new Promise(resolve => setTimeout(resolve, time)); }

function always() {
    if (connectionArray.length) {
        sleep(1000)
            .then(() => {
                connectionArray.forEach((tmpSocket) => {
                    tmpSocket.volatile.emit('broadcast', { description: `${Date()} is the date`});
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
