const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

// document structure
// TODO: add approved: Boolean
const eventSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter an event name'
  },
  host: {
    type: String,
    trim: true,
    required: 'Please enter an event host'
  },
  date: Date,
  duration: Number,
  address: {
    type: String,
    trim: true,
    required: 'Please enter the address of the event'
  },
  rsvpLink: String,
  notes: String,
});

// compile model and export
module.exports = mongoose.model('Event', eventSchema);