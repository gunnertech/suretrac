# SureTrac an Open Source GPS tracker for your web app
# Example Server

Here at Gunner Technology we needed a GPS tracker that could HTTP POST NMEA sentences to our server and let us use the GPS data in our web applications. Please note we only send the RMC NMEA sentences since we don't care about anything else besides coordinates, feel free to modify the code to handle anything else though, even make a pull request if you like!

An Instructable for the Hardware setup: [Link] (http://www.instructables.com/id/SureTrac-Open-Source-Software-Integrated-GPS/)

The Repo for the Hardware Code: [Link] (https://github.com/gunnertech/SureTrac_Hardware)

## What this does
This example server collects data from all GPS trackers and displays their coordinates on a map in real-time.

## How to setup and run the server

1. Clone the Repo

  ```bash
  git clone https://github.com/gunnertech/SureTrac_Example_Server.git
  ```
2. Install Dependencies

  ```bash
  npm install
  ```
3. Create a .env file

  ```env
  GOOGLE_MAPS_CLIENT_API_KEY=YOUR_GOOGLE_MAPS_CLIENT_KEY_HERE
  MONGODB_URI=mongodb://localhost/suretrac
  ```
4. Start the server!

  ```bash
  npm start
  ```

## API Examples

When using examples, make sure to replace localhost with the appropriate server.

### List all registered devices
```
curl -H 'Content-Type: application/json' http://localhost:3000/devices
```

### Register a new device
```
curl -H 'Content-Type: application/json' -X POST http://localhost:3000/devices
```

This will return a device id, which you use when sending location data for a device (next example)

### Update a device's poisiton
```
curl -H 'Content-Type: application/json' -X PUT -d '{"nmea-sentence": "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A"}' http://localhost:3000/devices/<device id>
```

TODO: It would be nice if we could sent a nmea sentence or points directly

### Register a new point of interest

```
curl -H 'Content-Type: application/json' -X POST -d '{"endpoint":"http://myserver.com/pois/notify", "distance": "5", "distanceUnits": "miles", "uuid": "cody-test-app-washington-monument", "locationData": "153 NE Sagamore Terr Port Saint Lucie, FL, 34983", "longitude": "", "latitude":""}' http://localhost:3000/pois
```
These parameters require a bit of explination

* endpoint: This is the url that the application will POST to whenever a *device* gets within *distance* of the *point of interest*

* distance: The threshold for which the endpoint should be alerted

* distanceUnits: Either "miles" or "time"

* uuid: A string you can use to name the poi. Note that this MUST be unique, so don't use "Washington Monument" use "Qualis: Washington Monument" to distinguish potential name collisions

* locationData: In lieu of actual lat/long points, you may pass an address or city/state and the app will geocode this data for you. If you pass longitude and latitude, you can skip this parameter.

* name: Optional - a name like "Cody's House" used for descriptive purposes

* description: Optional - a description which can include a link that provides more information about the location.


