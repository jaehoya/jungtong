const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: 'MC access required' });
  }
  next();
};
