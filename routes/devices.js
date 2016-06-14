var Mongoose = require('mongoose');
var Express = require('express');
var NMEA = require('nmea-0183'); 
var Router = Express.Router(); 

Mongoose.connect(process.env.MONGODB_URI);

var DeviceSchema = Mongoose.Schema({
  lattitude: String,
  longitude: String
});

var NotificationSchema = Mongoose.Schema({
  endpoint: String,
  distance: String,
  distanceUnits: String
});

var Device = Mongoose.model('Device', DeviceSchema);
var Notification = Mongoose.model('Notification', NotificationSchema);

// TODO: API Key validation for each one?

// GET /devices
Router.get('/', (req, res) => {
  Device.find({}, function(err, devices) {
    res.send(devices);  
  });
});

// POST /devices
Router.post('/', (req, res) => {
  (new Device).save();
  res.send();
});

// GET /devices
Router.get('/', (req, res) => {
  Device.find({}, function(err, devices) {
    res.send(devices);  
  });
});

// GET /devices/:id
Router.get('/:id', (req, res) => {
  Device.findOne({ _id: req.params.id }, (err, device) => {
    if (err) {
      // TODO: ERROR
      console.log(err);
      return;
    }

    res.send(device);
  });
});

// PUT /devices/:id
Router.put('/:id', (req, res) => {
  var originalSentence = req.body["nmea-sentence"];

  if (!originalSentence) {
    // TODO: ERROR
    return;
  }

  // Add try-catch
  var gprmcObject = NMEA.parse(originalSentence);

  Device.findOne({ _id: req.params.id }, (err, device) => {
    if (err) {
      // TODO: ERROR
      console.log(err);
      return;
    }

    device.lattitude = gprmcObject.lattitude;
    device.longitude = gprmcObject.longitude;
    device.save();
  });
});

module.exports = Router;
