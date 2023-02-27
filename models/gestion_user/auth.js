const jwt = require("jsonwebtoken");
const User = require("../gestion_user/user");
const jwtSecret = process.env.JWT_SECRET;

// eslint-disable-next-line complexity
const auth = async (req, res, next) => {
  try {
    const token_before_replace = req.header("Authorization");
    if (!token_before_replace) {
      return res.status(401).json({ error: "Invalid Token" });
    }
    const token = token_before_replace.replace("Bearer ", "");
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Authentication failed" });
  }
};
// eslint-disable-next-line complexity
const auth_permission_checker = (permission) => async (req, res, next) => {
  try {
    const token_before_replace = req.header("Authorization");
    if (!token_before_replace) {
      return res.status(401).json({ error: "Invalid Token" });
    }
    const token = token_before_replace.replace("Bearer ", "");
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) throw new Error();
    if (permission && user.permissions) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

function generateToken(user) {
  const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: "24h" });
  return token;
}
module.exports = [auth, generateToken,auth_permission_checker];