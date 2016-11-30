var mongoose = require('mongoose');
var Device = require('./Device.js');
var Client = require('node-rest-client').Client;
var client = new Client();
var Promise = require('bluebird');

var LocationSchema = mongoose.Schema({
  latitude: String,
  longitude: String,
  device: {type: mongoose.Schema.Types.ObjectId, ref:'Device'},
  distances: [{
  	distance: {
  		text: String,
  		value: Number
  	},
  	duration: {
  		text: String,
  		value: Number
  	},
  	status: String,
  	pointOfInterest: {
  		id: mongoose.Schema.Types.ObjectId,
	    uuid: String,
	    name: String
  	}
  }]
}, {
	timestamps: true
});

LocationSchema.post('save', function (location) {
	if(location.distances && location.distances.length) {
		return;
	}

	var Device = require('./Device.js')

	location.distances = location.distances || [];

	require('./PointOfInterest.js').find({active: true})
	.then(function(pois) {
		pois.forEach(function(poi) {
			setTimeout(function() {
				new Promise(function(resolve, reject) {
					console.log("https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins="+location.latitude+","+location.longitude+"&destinations="+poi.latitude+","+poi.longitude+"&key="+process.env.GOOGLE_MAPS_CLIENT_API_KEY)
					client.get("https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins="+location.latitude+","+location.longitude+"&destinations="+poi.latitude+","+poi.longitude+"&key="+process.env.GOOGLE_MAPS_CLIENT_API_KEY, {}, function(data, response) {
					  resolve(data);
					}).on('error', function (err) {
			    	reject(err);
					});
				})
				.then(function(response) {
					var obj = response.rows[0].elements[0];
					obj.pointOfInterest = {
						id: poi._id+"",
						uuid: poi.uuid,
						name: poi.name
					};

					location.distances.push(obj);
					location.save()
					.then(function() {
						return [poi, location, Device.findById(location.device), obj];
					})
					.spread(function(poi, location, device, obj) {
						if(poi.distanceUnits === "miles") {
							var testValue = (poi.distance * 1609.34);
							if(obj.distance.value <= testValue) {
								poi.sendNotificationFor(device);
							}
						} else if(poi.distanceUnits === "minutes") {
							var testValue = (poi.distance * 60.0);
							if(obj.duration.value <= testValue) {
								poi.sendNotificationFor(device);
							}
						}
					})
				})
				.catch(function(err) {
					console.log(err)
				})
				.error(function(err) {
					console.log(err)
				})
			},2000);
		});
	})
	.error(( (err) => next(err) ));
});


LocationSchema.pre('save', function (next) {
	require('./Device.js').update( {_id: this.device}, { $addToSet: {locations: this._id } } )
	.then(( (devices) => next() ))
	.error(( (err) => next(err) ));
});

LocationSchema.pre('remove', function (next) {
	require('./Device.js').update( {_id: this.device}, { $pullAll: {locations: [this._id] } } )
	.then(( (devices) => next() ))
	.error(( (err) => next(err) ));
});

module.exports = mongoose.model('Location', LocationSchema);
