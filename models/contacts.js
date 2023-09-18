const fs = require("fs");
const path = require("path");

const contactsPath = path.join(__dirname, "contacts.json");

const users = require("./contacts.json");

const listContacts = async () => {
  try {
    return users;
  } catch (error) {
    console.log(error.toString());
  }
};
const getContactById = async (contactId) => {
  try {
    const contact = users.find((el) => el.id === contactId);
    return contact;
  } catch (error) {
    console.log(error.toString());
  }
};

const removeContact = async (contactId) => {
  try {
    const contact = users.filter((el) => el.id !== contactId);
    await saveContactsToFile(contact);
    return contact;
  } catch (error) {
    console.log(error.toString());
  }
};

const addContact = async (body) => {
  try {
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      throw new Error("missing required fields");
    }

    const newContact = {
      id: Date.now().toString(),
      name,
      email,
      phone,
    };

    users.push(newContact);
    await saveContactsToFile(users);

    return newContact;
  } catch (error) {
    console.log(error.toString());
  }
};

const updateContact = async (contactId, body) => {
  try {
    const { name, email, phone } = body;

    const contactIndex = users.findIndex((el) => el.id === contactId);

    if (contactIndex === -1) {
      return null;
    }
    users[contactIndex] = {
      ...users[contactIndex],
      id: contactId,
      name,
      email,
      phone,
    };

    await saveContactsToFile(users);

    return users[contactIndex];
  } catch (error) {
    console.log(error.toString());
  }
};

function saveContactsToFile(contacts) {
  const jsonContacts = JSON.stringify(contacts, null, 2);

  return fs.promises
    .writeFile(contactsPath, jsonContacts)
    .then(() => {
      console.log("Contacts saved successfully");
    })
    .catch((error) => {
      console.error("Error saving contacts:", error);
    });
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
