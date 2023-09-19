const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const list = await listContacts();
  res.send(list);
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  if (!contactId) {
    return res.status(404).json({ message: "Not found" });
  }

  const getById = await getContactById(contactId);
  res.send(getById);
});

router.post("/", async (req, res, next) => {
  const { error } = contactSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "missing required name - field" });
  }

  try {
    const newContact = await addContact({
      name,
      email,
      phone,
    });

    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Failed to add contact" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const removedContact = await removeContact(contactId);

  if (!removedContact) {
    return res.status(404).json({ message: "Not found" });
  }

  res.status(200).json({ message: "contact deleted" });
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const { error } = contactSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const updatedContact = await updateContact(contactId, req.body);

  if (!updatedContact) {
    return res.status(404).json({ message: "missing fields" });
  }

  res.status(200).json(updatedContact);
});

module.exports = router;
