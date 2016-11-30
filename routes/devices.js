var Mongoose = require('mongoose');
var Express = require('express');
var NMEA = require('nmea-0183'); 
var Router = Express.Router(); 
var Promise = require('bluebird');
var _ = require('lodash');

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
  device.save()
  .then(function() {
    res.json(device._id);
  })
});

// GET /devices
Router.get('/', (req, res) => {
  Device.find({})
  .then(function(devices) {
    res.json(devices);  
  });
});

// GET /devices/:id
Router.get('/:id', (req, res) => {
  Device.findById(req.params.id).populate({
    path: 'locations',
    populate: {
      path: 'distances'
    }
  })
  .then(function(device) {
    res.json(device);
  })
  .error(function(err) {
    res.status(404).send();
  })
});

// PUT /devices/:id
Router.put('/:id', (req, res) => {
  //fix old implementation
  if(req.body["nmea-sentence"]) {
    req.body.nmeaSentence = req.body["nmea-sentence"];
    delete req.body["nmea-sentence"];
  }

  Device.findOne({ _id: req.params.id })
  .then(function(device) {
    _.extend(device, req.body);  
    return device.save().then(function(){ return device; });
  })
  .then(function(device) {
    res.status(200).json({});
  });
});

module.exports = Router;
