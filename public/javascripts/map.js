var INTERVAL = 1000;
var markerStore = {};
var map;
var deviceId;

function initMap() {
  var treasureCoastLocation = new google.maps.LatLng(27.203038,-80.254097);
  map = new google.maps.Map(document.getElementById("map"), {
    center: treasureCoastLocation,
    zoom: 13
  });

  deviceId = location.search.replace(/\?deviceId=/,"");

  getPoiMarkers();
  getDeviceMarkers(true);
  window.setInterval(getDeviceMarkers, INTERVAL);

  if(deviceId) {
    getLocationMarkers(true);
    window.setInterval(getLocationMarkers, INTERVAL);    

    $('#map-title').html("Showing location history for device: " + deviceId);
  } else {
    $('#map-title').html("Showing all devices");
  }
}

function getPoiMarkers() {
  $.get('/pois', {}, function(res, resStatus) {
    for (var i = 0, len = res.length; i < len; i++) {
      var lat = res[i].latitude;
      var lon = res[i].longitude;
      var id = res[i]._id;

      if (!(lat && lon && id)) {
        continue;
      }

      var latLng = new google.maps.LatLng(lat, lon);
      if(markerStore.hasOwnProperty(id)) {
        markerStore[id].setPosition(latLng);
      } else {
        var marker = new google.maps.Marker({
          position: latLng,
          title: res[i].uuid,
          map: map
        });
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        marker.setMap(map);

        marker.poi = res[i];

        marker.addListener('click', function() {
          var contentString = '<div id="content"><h3>UUID: ' + this.poi.uuid + '</h3><h5>' + this.poi.name + '</h5><p>' + this.poi.description + '</p></div>';
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          infowindow.open(map, marker);
        });

        markerStore[id] = marker;
      }
    }
  }, "json");
}


function getDeviceMarkers(initial) {
  var bounds = new google.maps.LatLngBounds();

  $.get('/devices', {}, function(res, resStatus) {
    for (var i = 0, len = res.length; i < len; i++) {
      var lat = res[i].latitude;
      var lon = res[i].longitude;
      var id = res[i]._id;

      if (!(lat && lon && id)) {
        continue;
      }

      var latLng = new google.maps.LatLng(lat, lon);
      if(markerStore.hasOwnProperty(id)) {
        markerStore[id].setPosition(latLng);
      } else {
        var marker = new google.maps.Marker({
          position: latLng,
          title: 'Device id: ' + res[i],
          map: map
        });
        marker.setMap(map);

        marker.device = res[i];

        marker.addListener('click', function() {
          var contentString = '<div id="content"><h3>Device id: ' + this.device._id + '</h3><p><em>Last Updated '+moment(this.device.updatedAt).fromNow()+' </em><p><a href="?deviceId='+this.device._id+'">View Location History</a></p></div>';
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          infowindow.open(map, marker);
        });

        if(initial && !deviceId) {
          bounds.extend(marker.getPosition())
        }

        markerStore[id] = marker;
      }

      // map.setCenter(latLng);
    }
    if(initial && !deviceId) {
      map.fitBounds(bounds);
    }
  }, "json");
}

function getLocationMarkers(initial) {
  var bounds = new google.maps.LatLngBounds();
  // var markers = [];

  $.get('/devices/'+deviceId, {}, function(res, resStatus) {
    for (var i = 0, len = res.locations.length; i < len; i++) {
      var lat = res.locations[i].latitude;
      var lon = res.locations[i].longitude;
      var id = res.locations[i]._id;

      if (!(lat && lon && id)) {
        continue;
      }

      var latLng = new google.maps.LatLng(lat, lon);
      if(markerStore.hasOwnProperty(id)) {
        markerStore[id].setPosition(latLng);
      } else {
        var marker = new google.maps.Marker({
          position: latLng,
          title: 'UUID: ' + res.locations[i].uuid,
          map: map
        });
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
        marker.setMap(map);

        marker.res = res;
        marker.location = res.locations[i];

        marker.addListener('click', function() {
          var res = this.res;
          var location = this.location;
          var contentString = '<div id="content"><h3>Device id: ' + res._id + '</h3><p>Created '+moment(location.createdAt).fromNow()+'<p>';

          if(location.distances && location.distances.length) {
            contentString += '<h5>Distances from POIs</h5><ul>';
            $.each(location.distances, function(i, distance) {
              contentString += '<li>'+distance.pointOfInterest.name+': '+distance.distance.text+' ('+distance.duration.text+')</li>';
            })
            contentString += '</ul>';
          }

          contentString += '</div>';
          
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          infowindow.open(map, this);
        });

        if(initial) {
          bounds.extend(marker.getPosition())
        }

        markerStore[id] = marker;
      }

      // map.setCenter(latLng);
    }
    if(initial) {
      map.fitBounds(bounds);
    }
  }, "json");
}
