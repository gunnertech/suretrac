var Mongoose = require('mongoose');

var NotificationSchema = Mongoose.Schema({
  endpoint: String,
  distance: String,
  distanceUnits: String
});

module.exports = Mongoose.model('Notification', NotificationSchema);
