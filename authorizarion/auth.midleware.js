const jwt = require("jsonwebtoken");
const User = require("../user/user.model");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: userId, token });

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { authMiddleware };
