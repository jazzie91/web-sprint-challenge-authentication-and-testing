const express = require('express');
const session = require('express-session')
const restrict = require('./middleware/restricted.js');
const Store = require('connect-session-knex')(session)
const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');

const server = express();


server.use(express.json());
server.use(session{
    name: 'knuckles',
    secret: 'keep it secret',
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false, 
        httpOnly: false,
    }, 
    resave: false,
    saveUninitialized: false,
    store: new Store({
        knex: require('./database/db-config'),
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 60,
    })
})

server.use('/api/auth', authRouter);
server.use('/api/jokes', restrict, jokesRouter); // only logged-in users should have access!

module.exports = server;
