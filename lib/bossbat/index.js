const Bossbat = require('bossbat');

const bossbat = new Bossbat({
    connection: process.env.REDIS_URL,
    prefix: 'bossbat',
});

module.exports = bossbat;
