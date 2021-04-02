const fetch = require('node-fetch');
const querystring = require('querystring');
const cookie = require('simple-cookie');

const getSessionId = async () => {
    const res = await fetch('https://online.dis.rs/inc/inc.nalog.prijava.php', {
        body: querystring.stringify({
            email: 'kolo022@gmail.com',
            lozinka: '1rE3RwUQ',
            radi: 'da',
        }),
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
        },
    });
    try {
        return cookie.parse(res.headers.get('set-cookie')).value;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return null;
    }
};

module.exports = getSessionId;
