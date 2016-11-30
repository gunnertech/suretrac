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

### Update a device's poisiton using nmea sentence
```
curl -H 'Content-Type: application/json' -X PUT -d '{"nmeaSentence": "$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A"}' http://localhost:3000/devices/<device id>
```

### Update a device's poisiton using lat/long
```
curl -H 'Content-Type: application/json' -X PUT -d '{"latitude": "38.8895", "longitude": "-77.0353"}' http://localhost:3000/devices/<device id>
```

### List the history of device's location
```
curl -H 'Content-Type: application/json' http://localhost:3000/devices/<device id>
```


### Register a new point of interest

```
curl -H 'Content-Type: application/json' -X POST -d '{"endpoint":"http://myserver.com/pois/notify", "distance": 5, "distanceUnits": "miles", "uuid": "cody-test-app-washington-monument", "name": "Codys House", "description": "Where Cody lives, duh.", "locationData": "153 NE Sagamore Terr Port Saint Lucie, FL, 34983", "longitude": "", "latitude":""}' http://localhost:3000/pois
```

```
curl -H 'Content-Type: application/json' -X POST -d '{"endpoint":"http://myserver.com/pois/notify", "distance": "5", "distanceUnits": "miles", "uuid": "real-washington-monument", "name": "Washtington Monument", "description": "Shhhhhh.", "locationData": "2 15th St NW, Washington, DC 20024", "longitude": "", "latitude":""}' http://localhost:3000/pois
```

These parameters require a bit of explination

* endpoint: This is the url that the application will POST to whenever a *device* gets within *distance* of the *point of interest*

* distance: The threshold for which the endpoint should be alerted

* distanceUnits: Either "miles" or "minutes"

* uuid: A string you can use to name the poi. Note that this MUST be unique, so don't use "Washington Monument" use "Qualis: Washington Monument" to distinguish potential name collisions

* locationData: In lieu of actual lat/long points, you may pass an address or city/state and the app will geocode this data for you. If you pass longitude and latitude, you can skip this parameter.

* name: Optional - a name like "Cody's House" used for descriptive purposes

* description: Optional - a description which can include a link that provides more information about the location.

## Sample Usage

In this section, we'll create an end-to-end example of how this will work.

If you want to try this, make sure you update the device ids and also change the localhost server (to https://suretrac.herokuapp.com) if you don't have a local machine up and running

### Step 1: Register a new Place Of Interest

In this case, we're going to use the address for the Washington Monument, but this would be where Qualis creates a POI using the address of an order.

In this case, if *any* device gets within 5 miles of this POI, SureTrack will POST to the endpoint passed below.

```
curl -H 'Content-Type: application/json' -X POST -d '{"endpoint":"http://myserver.com/pois/notify", "distance": "5", "distanceUnits": "miles", "uuid": "real-washington-monument", "name": "Washington Monument", "description": "Shhhhhh.", "locationData": "2 15th St NW, Washington, DC 20024", "longitude": "", "latitude":""}' http://localhost:3000/pois
```

### Step 2: Register a new device

For Qualis, each Vendor truck will have a device inside it, which will get an id the first time it's plugged into OBDII

```
curl -H 'Content-Type: application/json' -X POST http://localhost:3000/devices
```

### Step 3: Give that device it's initial location using the device id returned from step 2

For Qualis, each device will broadcast it's location every 10 seconds.

In this case, we're going to use the coordinates for about three hours away from the Washington Monument

```
curl -H 'Content-Type: application/json' -X PUT -d '{"latitude": "37.8895", "longitude": "-77.0353"}' http://localhost:3000/devices/583e42e1eb8726e96f8b3e70

```

Open or reload the map at http://localhost:3000/

You should see a Green Marker for our POIs and Red Markers for our devices

### Step 4: Update the same device's location

```
curl -H 'Content-Type: application/json' -X PUT -d '{"latitude": "36.8895", "longitude": "-77.0353"}' http://localhost:3000/devices/583e42e1eb8726e96f8b3e70

```

Open or reload the map at http://localhost:3000/

You should see a Green Marker for our POIs and Red Markers for our devices.

Click a Red Marker and you should then see yellow markers indicating where that device has been.


### Step 5: Update the same device's location to be within our 5 mile threshold

```
curl -H 'Content-Type: application/json' -X PUT -d '{"latitude": "38.8895", "longitude": "-77.0353"}' http://localhost:3000/devices/583e42e1eb8726e96f8b3e70
```

This should create another yellow marker on the map and POST a notification to the endpoint URL.

The endpoint can then choose what to do:

1) Send an email
2) Update an order status
3) Etc

If the server responds with the following JSON, the POI will be deactivated and won't trigger any more notifications:

```
{ "action": "remove" }
```
