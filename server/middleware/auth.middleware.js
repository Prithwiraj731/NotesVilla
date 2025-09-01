const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ msg: 'Not an admin' });
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
