const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// GET /api/appointments
router.get('/', auth, async (req, res) => {
  try {
    const { status, clientId, date, page = 1, limit = 20 } = req.query;
    const query = { astrologer: req.user.id };

    if (status) query.status = status;
    if (clientId) query.client = clientId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('client', 'name zodiacSign phone')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ appointments, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, astrologer: req.user.id })
      .populate('client', 'name zodiacSign phone email');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments
router.post('/', auth, async (req, res) => {
  try {
    const appt = await Appointment.create({ ...req.body, astrologer: req.user.id });
    const populated = await appt.populate('client', 'name zodiacSign phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/appointments/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, astrologer: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name zodiacSign phone');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const appt = await Appointment.findOneAndDelete({ _id: req.params.id, astrologer: req.user.id });
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
