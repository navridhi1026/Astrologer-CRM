const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const Note = require('../models/Note');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      totalClients,
      todayAppointments,
      pendingAppointments,
      totalNotes,
      monthlyAppointments,
      recentClients,
      upcomingAppointments,
      zodiacDistribution,
    ] = await Promise.all([
      Client.countDocuments({ astrologer: userId }),
      Appointment.countDocuments({ astrologer: userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      Appointment.countDocuments({ astrologer: userId, status: 'Scheduled' }),
      Note.countDocuments({ astrologer: userId }),
      Appointment.countDocuments({ astrologer: userId, date: { $gte: startOfMonth }, status: 'Completed' }),
      Client.find({ astrologer: userId }).sort({ createdAt: -1 }).limit(5).select('name zodiacSign createdAt'),
      Appointment.find({ astrologer: userId, status: 'Scheduled', date: { $gte: new Date() } })
        .populate('client', 'name zodiacSign')
        .sort({ date: 1 })
        .limit(5),
      Client.aggregate([
        { $match: { astrologer: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
        { $group: { _id: '$zodiacSign', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    res.json({
      totalClients,
      todayAppointments,
      pendingAppointments,
      totalNotes,
      monthlyAppointments,
      recentClients,
      upcomingAppointments,
      zodiacDistribution,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
