const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');
const User = require('../users/users-model');
const { validateCredentials } = require('./validate');
const { checkUsernameFree, checkUsernameExists } = require('./auth-middleware');
const { JWT_SECRET } = require('../secrets');

// Register Route
router.post('/register', validateCredentials, checkUsernameFree, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = await User.add({ username, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Route
router.post('/login', validateCredentials, checkUsernameExists, (req, res) => {
  try {
    if (bcrypt.compareSync(req.body.password, req.user.password)) {
      const token = buildToken(req.user);
      res.json({
        message: `${req.user.username} is back`,
        token,
      });
    } else {
      res.status(401).json({ message: 'invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
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
