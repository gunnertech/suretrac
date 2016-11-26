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

        var contentString = '<div id="content"><h3>UUID: ' + res[i].uuid + '</h3><h5>' + res[i].name + '</h5><p>' + res[i].description + '</p></div>';


        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker.addListener('click', function() {
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

        var contentString = '<div id="content"><h3>Device id: ' + res[i]._id + '</h3><p><em>Last Updated: '+res[i].updatedAt+' </em><p><a href="?deviceId='+res[i]._id+'">View Location History</a></p></div>';


        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker.addListener('click', function() {
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

  $.get('/devices/'+deviceId, {}, function(res, resStatus) {
    console.log(res);
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

        var contentString = '<div id="content"><h3>Device id: ' + res._id + '</h3><p><em>Created At: '+res.locations[i].createdAt+' </em><p></div>';


        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker.addListener('click', function() {
          infowindow.open(map, marker);
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
