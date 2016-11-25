
var express = require('express');
var Router = express.Router(); 

var PointOfInterest = require('../models/PointOfInterest.js');

// TODO: API Key validation for each one? Basic Auth?

// GET /pois
Router.get('/', (req, res) => {
  PointOfInterest.find({})
  .then(function(pois) {
    res.json(pois);  
  });
});

// POST /pois
Router.post('/', (req, res) => {

  PointOfInterest.create(req.body)
  .then(function(poi) {
    res.json(poi);  
  });

  
});

module.exports = Router;
