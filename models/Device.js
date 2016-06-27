var Mongoose = require('mongoose');

var DeviceSchema = Mongoose.Schema({
  latitude: String,
  longitude: String
});

module.exports = Mongoose.model('Device', DeviceSchema);
