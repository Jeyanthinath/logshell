const rethinkdbdash = require('rethinkdbdash');

// connect to databases
const r = rethinkdbdash({
    db: 'hackathon',
    servers: [
        { host: 'localhost', port: 28015 },
    ],
    ssl: { rejectUnauthorized: false },
});

module.exports = r;
