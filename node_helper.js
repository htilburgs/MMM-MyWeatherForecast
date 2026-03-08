const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-MyWeatherForecast helper started...");
        this.cache = null;
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { apiKey, userlat, userlon, units, lang } = payload;

            // Build URL for PirateWeather API using language from config
            const url = `https://api.pirateweather.net/forecast/${apiKey}/${userlat},${userlon}?units=${units}&lang=${lang}`;

            console.log("[MMM-MyWeatherForecast] Fetching URL:", url);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();

                // Cache the latest successful fetch
                this.cache = data;

                console.log("[MMM-MyWeatherForecast] Weather data fetched successfully.");
                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("[MMM-MyWeatherForecast] Fetch error:", err.message);

                if (this.cache) {
                    console.warn("[MMM-MyWeatherForecast] Sending cached weather data as fallback.");
                    this.sendSocketNotification("WEATHER_RESULT", this.cache);
                } else {
                    console.error("[MMM-MyWeatherForecast] No cached data available. Sending WEATHER_ERROR.");
                    this.sendSocketNotification("WEATHER_ERROR", err.message);
                }
            }
        }
    }
});
