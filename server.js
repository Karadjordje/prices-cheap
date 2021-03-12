require('dotenv').config();
const express = require('express');
const api = require('./api');

require('./jobs');

const app = express();

app.use('/api', api);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`app started at ${port}`);
});
