const express = require('express');
const api = require('../api/api');

const app = express();

app.use(api);

module.exports = app;
