const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  serverPort: process.env.PORT || 3000,
  mongoConnectionString: process.env.Mongo_Connection,
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS,
};
