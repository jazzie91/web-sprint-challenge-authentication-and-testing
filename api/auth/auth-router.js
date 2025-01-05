const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db'); 

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secret';
const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10;


function validateRequestBody(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  next();
}


function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: 'Too many login attempts, please try again later.' },
});


router.post('/register', validateRequestBody, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    console.log('[Register] Checking if username exists:', username);
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      console.log('[Register] Username already taken:', username);
      return res.status(400).json({ message: 'Username already taken' });
    }

    console.log('[Register] Hashing password for:', username);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({ username, password: hashedPassword });

    console.log('[Register] User created successfully:', newUser);
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
    });
  } catch (error) {
    console.error('[Register] Error during user creation:', error);
    res.status(500).json({ message: 'Internal server error' });
    next(error);
  }
});



router.post('/login', loginLimiter, validateRequestBody, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    console.log(`[Login] Fetching user by username: ${username}`);
    const existingUser = await db.getUserByUsername(username);
    if (!existingUser) {
      console.log(`[Login] User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Login] Comparing password for user: ${username}`);
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      console.log(`[Login] Password mismatch for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Login] Generating token for user: ${username}`);
    const token = jwt.sign(
      { id: existingUser.id, username: existingUser.username },
      SECRET_KEY,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    res.status(200).json({
      message: `Welcome, ${existingUser.username}`,
      token,
    });
  } catch (error) {
    console.error('[Login] Error occurred:', error);
    next(error);
  }
});


router.get('/me', authenticateToken, (req, res) => {
  res.status(200).json({ id: req.user.id, username: req.user.username });
});


router.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = router;
