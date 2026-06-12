const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  type: {
    type: String,
    enum: ['Birth Chart', 'Tarot Reading', 'Numerology', 'Vastu', 'Relationship', 'Career', 'General'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled'
  },
  fee: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
