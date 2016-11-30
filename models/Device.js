var mongoose = require('mongoose');
var Location = require('./Location.js');
var PointOfInterest = require('./PointOfInterest.js');
var Promise = require('bluebird');
var _ = require('lodash');
var nmea = require('nmea-0183'); 

var DeviceSchema = mongoose.Schema({
  latitude: String,
  longitude: String,
  nmeaSentence: String,
  locations: [{type: mongoose.Schema.Types.ObjectId, ref:'Location'}]
}, {
	timestamps: true
});

DeviceSchema.pre('save', function (next) {
	var self = this;
	if(self.nmeaSentence) {
		var gprmcObject = null;
		try {
			self.nmeaSentence = self.nmeaSentence.replace('\0', '');
			gprmcObject = nmea.parse(self.nmeaSentence);
		} catch (e) {
			console.log(e);
		}

		if(gprmcObject) {
			self.latitude = gprmcObject.latitude;
			self.longitude = gprmcObject.longitude;
			self.nmeaSentence = null;
		}
	}
	next();
});

DeviceSchema.post('save', function (device) {
	if(device.latitude && device.longitude) {
		Location.create({
			latitude: device.latitude,
			longitude: device.longitude,
			device: device._id
		})
		.then(function(location) {
			console.log(location);
		})
	}
});

module.exports = mongoose.model('Device', DeviceSchema);
