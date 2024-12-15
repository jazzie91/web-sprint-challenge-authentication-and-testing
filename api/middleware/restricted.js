const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; 

function restricted(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid' });
  }
}

module.exports = restricted;
