const express = require('express');
const api = require('../api/rethinkapi');

const router = express.Router();

router.get('/logs', api.logs);

module.exports = router;
