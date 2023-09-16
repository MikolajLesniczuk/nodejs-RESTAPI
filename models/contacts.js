const fs = require("fs");
const path = require("path");

const contactsPath = path.join(__dirname, "contacts.json");

const users = require("./contacts.json");

const listContacts = async () => {
  return users;
};
const getContactById = async (contactId) => {
  const contact = users.find((el) => el.id === contactId);
  return contact;
};

const removeContact = async (contactId) => {
  const contact = users.filter((el) => el.id !== contactId);
  await saveContactsToFile(contact);
  return contact;
};

const addContact = async (body) => {
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
};

const updateContact = async (contactId, body) => {
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
