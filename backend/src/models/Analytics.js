const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  userAgent: {
    type: String,
    default: ''
  },
  browser: {
    type: String,
    default: 'Other'
  },
  os: {
    type: String,
    default: 'Other'
  },
  device: {
    type: String,
    default: 'Desktop' // Mobile, Tablet, Desktop, Other
  },
  country: {
    type: String,
    default: 'Localhost'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  region: {
    type: String,
    default: 'Unknown'
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
