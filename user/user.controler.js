const User = require("./user.model");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const gravatar = require("gravatar");
const mimeTypes = require("mime-types");
const path = require("path");
const jimp = require("jimp");
const { sendVerificationToken } = require("./user-mailer.service");
const { v4: uuid } = require("uuid");
const { error } = require("console");

const uploadAvatar = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
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
      { token: token },
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

const createUser = async (userData) => {
  try {
    return await User.create({
      ...userData,
      verified: false,
      verificationToken: uuid(),
    });
  } catch (e) {
    console.error(e);
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

    const newUser = await createUser({
      email,
      password,
      avatarURL: avatar,
    });
    await sendVerificationToken(newUser.email, newUser.verificationToken);
    console.log(newUser.verificationToken);
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
const getUser = async (filter) => {
  try {
    return await User.findOne(filter);
  } catch (e) {
    console.error(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    if (!user.verify) {
      return res.status(404).send({ message: "User is not verified." });
    } else {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      user.token = token;
      await user.save();

      res.status(200).send({
        user: {
          token,
          email: user.email,
          subscription: user.subscription,
        },
      });
    }
  } catch (error) {
    console.error(error);
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

const updateUser = async (email, userData) => {
  try {
    return await User.findOneAndUpdate({ email }, userData);
  } catch (e) {
    console.error(e);
    throw new error("some problems");
  }
};

const verifyHandler = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await getUser({ verificationToken });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.verify) {
      return res.status(404).send({ message: "User is already verified. " });
    }

    await updateUser(user.email, {
      verify: true,
      verificationToken: null,
    });

    return res.status(200).send({ message: "Verification successful" });
  } catch (e) {
    return next(e);
  }
};

const resendVerificationHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await getUser({ email: email });

    if (email) {
      return res.status(400).send({ message: "missing required field email" });
    }

    if (!user) {
      return res.status(400).send({ message: "User does not exist." });
    }

    if (user.verify) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }

    await sendVerificationToken(user.email, user.verificationToken);

    return res.status(200).send({ message: "Verification email sent" });
  } catch {
    return next(e);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  getUsers,
  uploadAvatar,
  verifyHandler,
  resendVerificationHandler,
};
