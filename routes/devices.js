var Mongoose = require('mongoose');
var Express = require('express');
var NMEA = require('nmea-0183'); 
var Router = Express.Router(); 

var Device = require('../models/Device.js');

// TODO: API Key validation for each one? Basic Auth?

// GET /devices
Router.get('/', (req, res) => {
  Device.find({}, function(err, devices) {
    res.send(devices);  
  });
});

// POST /devices
Router.post('/', (req, res) => {
  var device = new Device;
  device.save();

  res.send(device._id);
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
      res.status(404).send();
      return;
    }

    res.send(device);
  });
});

// PUT /devices/:id
Router.put('/:id', (req, res) => {
  var originalSentence = req.body["nmea-sentence"];

  if (!originalSentence) {
    res.status(400).send("Must have a NMEA sentence in the {'nmea-sentence'} field");
    return;
  }

  // Add try-catch
  try {
    originalSentence = originalSentence.replace('\0', '');
    var gprmcObject = NMEA.parse(originalSentence);
  } catch (e) {
    res.status(500).send("Error parsing the NMEA sentence");
    return;
  }

  Device.findOne({ _id: req.params.id }, (err, device) => {
    if (err) {
      res.status(404).send("Device ID does not exist");
      return;
    }

    device.latitude = gprmcObject.latitude;
    device.longitude = gprmcObject.longitude;
    device.save();

    res.send("Success");
  });
});

module.exports = Router;
