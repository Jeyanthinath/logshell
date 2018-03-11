const rethinkdbdash = require('rethinkdbdash');
const config = require('../../config');

// connect to database
const r = rethinkdbdash({
    db: 'hackathon',
    servers: [
        { host: config.host, port: config.port },
    ],
    ssl: { rejectUnauthorized: false },
});

module.exports = r;
