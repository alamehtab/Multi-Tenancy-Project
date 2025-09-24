const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

// ✅ Auth middleware
exports.authenticate = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // { id, email, role, tenantId, tenantSlug }
    next();
  });
};

// ✅ Role check middleware
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
