const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: 'token invalid' });
    }
    req.decodedToken = decodedToken;
    next();
  });
};
