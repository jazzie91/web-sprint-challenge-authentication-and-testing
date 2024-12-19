const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secret';   


function validateRequestBody(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  next();
}


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

    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = await db.createUser({ username, password: hashedPassword });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
    });
  } catch (error) {
    next(error);
  }
});


router.post('/login', validateRequestBody, async (req, res, next) => {
  const { username, password } = req.body;

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
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: `Welcome, ${existingUser.username}`,
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
