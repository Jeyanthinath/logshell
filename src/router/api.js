const express = require('express');
const api = require('../api/rethinkapi');

const router = express.Router();

/*
http://localhost:8080/api/v1/logs?fromdate=20171003&todate=20171003
*/

router.get('/', (req, res) => {
    res.end('Router is on');
});

router.get('/logs', api.logs);

module.exports = router;
