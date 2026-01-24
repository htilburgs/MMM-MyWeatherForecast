# MMM-MyWeatherForecast
MagicMirror module weather information with optional 4-day forecast

```
cd ~/MagicMirror/modules
git clone https://github.com/htilburgs/MMM-MyWeatherForecast.git
cd MMM-MyWeatherForecast
npm install
```


```
{
    module: "MMM-MyWeatherForecast",
    position: "top_right",
    config: {
        apiKey: "YOUR_PIRATESKY_API_KEY",
        latitude: "52.3676",
        longitude: "4.9041",
        showForecast: true,
        showLastUpdate: true,
        lang: "nl"
    }
}

```
