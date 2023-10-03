const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  serverPort: process.env.PORT || 3000,
  mongoConnectionString: process.env.Mongo_Connection,
};
