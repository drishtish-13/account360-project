const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// ✅ Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Add a new contact
router.post('/', async (req, res) => {
  const { name, email, contact, profession } = req.body;

  if (!name || !email || !contact || !profession) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newContact = new Contact({ name, email, contact, profession });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (err) {
    console.error('Error adding contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update an existing contact
router.put('/:id', async (req, res) => {
  const { name, email, contact, profession } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, contact, profession },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(updatedContact);
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
