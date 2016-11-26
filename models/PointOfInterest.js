var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var Client = require('node-rest-client').Client;
var client = new Client();
var geocoder = require("geocoder");



var PointOfInterestSchema = mongoose.Schema({
  endpoint: String,
  distance: String,
  distanceUnits: {
  	type: String,
  	enum: ['miles','time']
  },
  uuid: {
		type: String,
		required: true,
		unique: true
	},
	name: String,
	description: String,
  active: Boolean,
  latitude: String,
  longitude: String,
  locationData: String
},{
	timestamps: true
});

PointOfInterestSchema.pre('save', function (cb) {
	var values = this;
	if(!values.locationData || (values.latitude && values.longitude)) {
		cb();
	} else {
		new Promise(function(resolve, reject) {
			geocoder.geocode(values.locationData, function(err, data) {
				resolve(data);
			})
		})
		.then(function(data) {
			values.longitude = data.results[0].geometry.location.lng;
			values.latitude = data.results[0].geometry.location.lat;
			cb();
		});
	}
});

PointOfInterestSchema.methods.sendNotificationFor = function(device) {
	var self = this;
	return new Promise(function(resolve, reject) {
		client.post(self.endpoint, {
			data: device,
		  headers: { "Content-Type": "application/json", "Accepts":  "application/json" }
		}, function(data, response) {
		  resolve(data);
		});
	})
	.then(function(data) {
		if( (data.action || "").toLowerCase() == 'remove') {
			self.active = 'false';
			return self.save().then(function() { return self; });
		}

		return self;
	});
}

module.exports = mongoose.model('PointOfInterest', PointOfInterestSchema);
