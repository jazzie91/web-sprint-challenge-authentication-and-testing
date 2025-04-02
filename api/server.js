const express = require('express');
const helmet = require('helmet');
const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');
const restrict = require('./middleware/restrict'); 

const server = express();

server.use(helmet());

server.use('/api/auth', authRouter);
server.use('/api/jokes', restrict, jokesRouter); 

module.exports = server;
