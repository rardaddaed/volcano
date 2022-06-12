const jwt = require('jsonwebtoken');

const authorize = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    req.noToken = true;
    next();
    return;
  } else {
    req.noToken = false;
  }
  if (auth.split(" ").length !== 2) {
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed"
    });
    return;
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.emailIdentity = payload.email;
    if (Date.now() > payload.exp) {
      res.status(401).json({
        error: true,
        message: "Expired JWT"
      });
      return;
    }

    next();
  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token"
    });
    return;
  }
};

module.exports = { authorize };