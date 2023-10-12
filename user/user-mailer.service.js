const { sendMail } = require("../mailer/mailer.service");

const sendVerificationToken = async (email, verificationToken) => {
  const mailOptions = {
    to: email,
    subject: "Welcome to hell!",
    text: `Hello! Please verify your account by visiting http://localhost:3000/api/users/verify/${verificationToken}`,
    html: `<h2>Hello!</h2><br/>You must verify your account, please click <a href="http://localhost:3000/api/users/verify/${verificationToken}">here</a>!`,
  };
  await sendMail(mailOptions);
};

module.exports = {
  sendVerificationToken,
};
