var INTERVAL = 100;
var markerStore = {};
var map;

function initMap() {
  var treasureCoastLocation = new google.maps.LatLng(27.203038,-80.254097);
  map = new google.maps.Map(document.getElementById("map"), {
    center: treasureCoastLocation,
    zoom: 13
  });

  getPoiMarkers();
  getDeviceMarkers(true);
  window.setInterval(getDeviceMarkers, INTERVAL);
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
          title: "A Vendor's Truck",
          map: map
        });
        marker.setMap(map);

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
