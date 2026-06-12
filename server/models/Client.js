const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  dateOfBirth: { type: Date },
  zodiacSign: {
    type: String,
    enum: [
      'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
      'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
    ]
  },
  suggestedGemstone: { type: String },
  address: { type: String },
  notes: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
