function validateCredentials(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }
  next();
}

module.exports = { validateCredentials };
