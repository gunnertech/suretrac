var INTERVAL = 5000;
var markerStore = {};
var map;

function initMap() {
  var treasureCoastLocation = new google.maps.LatLng(27.203038,-80.254097);
  map = new google.maps.Map(document.getElementById("map"), {
    center: treasureCoastLocation,
    zoom: 13
  });

  getMarkers();
}

function getMarkers() {
  $.get('/devices', {}, function(res, resStatus) {
    for (var i = 0, len = res.length; i < len; i++) {
      var lat = res[i].latitude;
      var lon = res[i].longitude;
      var id = res[i]._id;

      if (!(lat && lon && id)) {
        continue;
      }

      if(markerStore.hasOwnProperty(id)) {
        markerStore[id].setPosition(new google.maps.LatLng(lat, lon));
      } else {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lon),
          title: "A Vendor's Truck",
          map: map
        }); 

        markerStore[id] = marker;
      }
    }

    window.setTimeout(getMarkers, INTERVAL);
  }, "json");
}
