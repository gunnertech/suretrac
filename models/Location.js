var mongoose = require('mongoose');
var Device = require('./Device.js');

var LocationSchema = mongoose.Schema({
  latitude: String,
  longitude: String,
  device: {type: mongoose.Schema.Types.ObjectId, ref:'Device'}
}, {
	timestamps: true
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
