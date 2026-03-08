# MMM-MyWeatherForecast
This is a [Magic Mirror²](https://github.com/MichMich/MagicMirror) module for weather information and an optional 4-day forecast.</br>
It only uses the weather information from PirateWeather with a free API.</br></br>

<img width="415" height="302" alt="SCR-20260308-ouor" src="https://github.com/user-attachments/assets/f437156b-72c6-4d40-a540-d189bbaf0a7b" />

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
                showSunTimes: true,             // Show Sunrise and Sunset information
                riseSetDisplay: "both",         // Show Sunrise / Sunset as text | icon | both
                lang: "en",                     // Select language nl, de, en,  fr
                iconSet: "standard",            // standard | animated | custom (upload your own PNG icons)
                updateInterval: 10 * 60 * 1000  //Updates every 10 minutes
                }    
},
```

* To get your latitude and longitude, you can go to https://www.latlong.net/
* To get your Pirate Weather API key, you can go to https://pirateweather.net/en/latest/

## Icons
The standard icons are free icons from [Flaticon](https://www.flaticon.com/) <br/>
The animated icons are free icons from [Meteocons by Bas Milius](https://github.com/basmilius/weather-icons)

## Versions
#### v1.2.0 (08-03-2026)
* Add Iconsets for animated
* Possibility for custom icons
* Update language files
* Add riseSetDisplay option in config, to show Sunrise / Sunset as text, only icon or both
* Code optimized

#### v1.1.0 (27-01-2026)
* code and CSS optimize

#### v1.0.0 (Initial release 2026)

