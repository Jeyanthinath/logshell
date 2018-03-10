const express = require('express');
const rethinkdbdash = require('rethinkdbdash');
const crate = require('node-crate');


// lets make the app
const app = express();

// connect to databases
const r = rethinkdbdash({
    db: 'hackathon',
    servers: [
        { host: 'databases-internal.hackathon.venom360.com', port: 28015 },
    ],
    ssl: { rejectUnauthorized: false },
});


// doing the ritual
app.get('/hello', (req, res) => {
    res.end('Hello world !');
});

app.get('/logs', async (req, res) => {
    const value = await r.table('logs').limit(100).run();
    res.end(value);
});

module.exports = app;
