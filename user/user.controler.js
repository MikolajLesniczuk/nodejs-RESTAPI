const User = require("./user.model");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const gravatar = require("gravatar");
const mimeTypes = require("mime-types");
const path = require("path");
const jimp = require("jimp");

const hello = "initial commit";

const uploadAvatar = async (req, res) => {
  try {
    const userToken = req.body.token;

    if (!userToken) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const filename = `${Date.now()}.${mimeTypes.extension(req.file.mimetype)}`;

    const avatarImage = await jimp.read(req.file.path);
    await avatarImage.resize(250, 250).writeAsync(req.file.path);

    await fs.rename(
      req.file.path,
      path.join(__dirname, "../public/avatars", filename)
    );

    const avatarURL = `http://localhost:3000/avatars/${filename}`;

    const updatedUser = await User.findOneAndUpdate(
      { token: userToken },
      { avatarURL },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ avatarURL });
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }
    const avatar = gravatar.url(email, { default: "identicon" }, true);

    const newUser = new User({ email, avatarURL: avatar });
    await newUser.setPassword(password);
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    newUser.token = token;
    await newUser.save();

    res.status(201).json({
      user: {
        token: token,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      user: {
        token,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    req.user.token = null;
    await req.user.save();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  getUsers,
  uploadAvatar,
};
