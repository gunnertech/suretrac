var mongoose = require('mongoose');
var Location = require('./Location.js');
var Promise = require('bluebird');
var _ = require('lodash');

var DeviceSchema = mongoose.Schema({
  latitude: String,
  longitude: String,
  locations: [{type: mongoose.Schema.Types.ObjectId, ref:'Location'}]
});

DeviceSchema.methods.withinSpecifiedDistanceOf = function(poi) {
	return Promise.resolve(true); //TODO: actually check to see if the device is within 'distance' of poi
}

DeviceSchema.post('save', function (device) {
	Location.create({
		latitude: device.latitude,
		longitude: device.longitude,
		device: device._id
	})
	.then(function(location) {
		console.log(location);
	})
});

DeviceSchema.post('save', function (device) {
	PointOfInterest.find({active: true})
	.then(function(pois) {
		return Promise.all(_.map(pois, function(poi) {
			return device.withinSpecifiedDistanceOf(poi)
			.then(function(verdict) {
				return verdict ? poi : null;
			});
		}));
	})
	.then(function(pois) {
		pois = _.compact(_.flatten(pois));

		return Promise.all(_.map(pois, function(poi) {
			return pois.sendNotificationFor(device);
		}));
	});
});

module.exports = mongoose.model('Device', DeviceSchema);
