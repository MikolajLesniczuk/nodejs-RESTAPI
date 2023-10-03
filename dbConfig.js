const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const { mongoConnectionString } = require("./config");
const connect = async () => {
  try {
    await mongoose.connect(mongoConnectionString, {
      dbName: "db-contacts",
    });
  } catch (e) {
    console.error(e);
    throw new Error("Database connection failed");
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    throw new Error("Cannot disconnect from database!");
  }
};

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

const Contact = model("contacts", UserSchema);

module.exports = {
  Contact,
  connect,
  disconnect,
};
