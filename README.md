# MMM-MyWeatherForecast
This is a MagicMirror² module for weather information and an optional 4-day forecast.</br>
It only uses the weather information from PirateWeather with a free API.</br></br>

<img width="415" height="335" alt="image" src="https://github.com/user-attachments/assets/b9444dd3-bb8b-4096-b54d-95042e56efd1" />


## Installation
Clone this repository in your modules folder, and install dependencies:

```
cd ~/MagicMirror/modules
git clone https://github.com/htilburgs/MMM-MyWeatherForecast.git
cd MMM-MyWeatherForecast
npm install
```

## Update
When you need to update this module:

```
cd ~/MagicMirror/modules/MMM-MyWeatherForecast
git pull
npm install
```

## Configuration
Go to the MagicMirror/config directory and edit the config.js file.
Add the module to your modules array in your config.js.

```
{
        module: "MMM-MyWeatherForecast",
        position: "top_right",
        header: "My WeatherForeCast",
        disabled: false,
        config: {
                apiKey: "PUT_API_KEY_HERE",
                latitude: "PUT_LAT_HERE",
                longitude: "PUT_LON_HERE",
                units: "metric",                // metric or imperial
                showForecast: true,             // Show 4 day forecast
                showLastUpdate: true,           // Show when the data is last updated
                showSunTimes: true,             // Show Sun up and Sun Down information 
                lang: "en",                     // Select language nl, de, en, fr
                updateInterval: 10 * 60 * 1000  //Updates every 10 minutes
                }    
},
```

* To get your latitude and longitude, you can go to https://www.latlong.net/
* To get your Pirate Weather API key, you can go to https://pirateweather.net/en/latest/

## Icons
The icons are free icons from https://www.flaticon.com/ 

## Versions
v1.0.0  - Initial release </br>
