const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');
const User = require('../users/users-model');
const { validateCredentials } = require('./validate');
const { checkUsernameFree, checkUsernameExists } = require('./auth-middleware');
const { JWT_SECRET } = process.env; 

// Register Route
router.post('/register', validateCredentials, checkUsernameFree, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 8);  
    const newUser = await User.add({ username, password: hashedPassword });

    res.status(201).json(newUser);  
  } catch (err) {
    console.error(err);  
    res.status(500).json({ message: 'Something went wrong while registering user.' });
  }
});

// Login Route
router.post('/login', validateCredentials, checkUsernameExists, async (req, res) => {
  try {
    const { password } = req.body;
    
    
    const passwordMatch = bcrypt.compareSync(password, req.user.password);
    
    if (passwordMatch) {
      const token = buildToken(req.user); 
      res.json({
        message: `Welcome, ${req.user.username}`,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);  
    res.status(500).json({ message: 'Something went wrong during login.' });
  }
});

// Token Builder
function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = { expiresIn: '1d' }; 
  return jwt.sign(payload, JWT_SECRET, options);  
}

module.exports = router;
