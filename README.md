# MMM-MyWeatherForecast
MagicMirror module weather information with optional 4-day forecast

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/e496cc88-4317-4566-98cd-594cccb08faf" />


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
