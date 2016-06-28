# SureTrac an Open Source GPS tracker for your web app
# Example Server

Here at Gunner Technology we needed a GPS tracker that could HTTP POST NMEA sentences to our server and let us use the GPS data in our web applications. Please note we only send the RMC NMEA sentences since we don't care about anything else besides coordinates, feel free to modify the code to handle anything else though, even make a pull request if you like!

An Instructable for the Hardware setup: [Link] (http://www.instructables.com/id/SureTrac-Open-Source-Software-Integrated-GPS/)

The Repo for the Hardware Code: [Link] (https://github.com/gunnertech/WheresMyGuns_Hardware)

## What this does
This example server collects data from all GPS trackers and displays their coordinates on a map in real-time.

## How to setup and run the server

1. Clone the Repo

  ```bash
  git clone https://github.com/gunnertech/WheresMyGuns.git
  ```
2. Install Dependencies

  ```bash
  npm install
  ```
3. Create a .env file

  ```env
  GOOGLE_MAPS_CLIENT_API_KEY=YOUR_GOOGLE_MAPS_CLIENT_KEY_HERE
  MONGODB_URI=mongodb://localhost/wheresmyguns
  ```
4. Start the server!

  ```bash
  npm start
  ```
