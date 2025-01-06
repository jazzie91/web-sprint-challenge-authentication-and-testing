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


router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    
    const newUser = await db.createUser({ username, password: hashedPassword });

    
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
    });
  } catch (error) {
    console.error('Error creating user:', error.message); 
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const existingUser = await db.getUserByUsername(username);
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: existingUser.id, username: existingUser.username },
      SECRET_KEY,
      { expiresIn: '1h'}
    );

    
    res.status(200).json({
      message: `Welcome, ${existingUser.username}`,
      token,
    });
  } catch (error) {
    
    console.error('Login error:', error);
    
    res.status(500).json({ message: 'Internal server error' });
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
