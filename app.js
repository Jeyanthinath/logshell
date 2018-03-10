const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const api = require('./src/router/api');
const r = require('./src/utils/db');

// lets make the app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1', api);

// doing the ritual
app.get('/hello', (req, res) => {
    res.end('Hello world !');
});


// test logs < need to be removed >
app.get('/logs', async (req, res) => {
    try {
        const value = await r.table('logs').limit(10).run();
        const val = JSON.stringify(value[2]);
        res.end(`${val}`);
    } catch (err) {
        res.end('Error in Databse query');
    }
});

module.exports = app;
