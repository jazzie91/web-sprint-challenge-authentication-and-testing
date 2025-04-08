const express = require('express');
const helmet = require('helmet');
const restrict = require('./auth/restricted');
const authRouter = require('./auth/auth-router');
const jokesRouter = require('./jokes/jokes-router');

 
 const server = express();
 
 server.use(helmet());
 
 server.use('/api/auth', authRouter);
 server.use('/api/jokes', restrict, jokesRouter); // only logged-in users should have access!
 
 module.exports = server;