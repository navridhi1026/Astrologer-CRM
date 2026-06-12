const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  planetaryPositions: { type: String },
  predictions: { type: String },
  remedies: { type: String },
  followUpDate: { type: Date },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
