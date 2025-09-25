const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

exports.authenticate = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    // user should have: { id, email, role, tenantId, tenantSlug }
    req.user = user;
    next();
  });
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }
    next();
  };
};
