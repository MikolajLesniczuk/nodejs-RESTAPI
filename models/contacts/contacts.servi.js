const { Contact } = require("../../dbConfig");

const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.log(error.toString());
  }
};
const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.log(error.toString());
  }
};

const removeContact = async (contactId) => {
  try {
    const removedContact = Contact.findByIdAndRemove(contactId);
    return removedContact;
  } catch (error) {
    console.log(error.toString());
  }
};

const addContact = async (body) => {
  try {
    const newContact = new Contact(body);
    await newContact.save();
    return newContact;
  } catch (error) {
    console.log(error.toString());
  }
};

const updateContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

const updateStatusContact = async (contactId, favorite) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact status:", error);
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
