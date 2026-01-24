# MMM-MyWeatherForecast
This a MagicMirror² module for weather information and an optional 4-day forecast.

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/e496cc88-4317-4566-98cd-594cccb08faf" />


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

To get your latitude and longitude, you can go to https://latitudelongitude.org

## Versions
v1.0.0  - Initial release </br>
