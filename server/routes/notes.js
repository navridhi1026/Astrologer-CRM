const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// GET /api/notes
router.get('/', auth, async (req, res) => {
  try {
    const { clientId, appointmentId } = req.query;
    const query = { astrologer: req.user.id };
    if (clientId) query.client = clientId;
    if (appointmentId) query.appointment = appointmentId;

    const notes = await Note.find(query)
      .populate('client', 'name zodiacSign')
      .populate('appointment', 'title date type')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, astrologer: req.user.id })
      .populate('client', 'name zodiacSign')
      .populate('appointment', 'title date type');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes
router.post('/', auth, async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, astrologer: req.user.id });
    const populated = await note.populate([
      { path: 'client', select: 'name zodiacSign' },
      { path: 'appointment', select: 'title date type' }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notes/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, astrologer: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name zodiacSign').populate('appointment', 'title date type');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, astrologer: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
