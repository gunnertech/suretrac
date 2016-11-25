var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var Client = require('node-rest-client').Client;
var client = new Client();

var PointOfInterestSchema = mongoose.Schema({
  endpoint: String,
  distance: String,
  distanceUnits: String,
  uuid: {
		type: String,
		required: true,
		unique: true
	},
  active: Boolean,
  latitude: String,
  longitude: String,
  locationData: String
},{
	timestamps: true
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
