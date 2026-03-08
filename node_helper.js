const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-MyWeatherForecast helper started...");
        this.cache = null;
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { apiKey, userlat, userlon, units, lang } = payload;

            // Use lang passed by module; fallback to "en" if somehow missing
            const safeLang = lang || "en";
            const url = `https://api.pirateweather.net/forecast/${apiKey}/${userlat},${userlon}?units=${units}&lang=${safeLang}`;

            console.log("[MMM-MyWeatherForecast] Fetching URL:", url);

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();

                // Cache last successful fetch
                this.cache = data;
                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("[MMM-MyWeatherForecast] Fetch error:", err);
                if (this.cache) {
                    console.warn("[MMM-MyWeatherForecast] Sending cached weather data.");
                    this.sendSocketNotification("WEATHER_RESULT", this.cache);
                } else {
                    this.sendSocketNotification("WEATHER_ERROR", err.message);
                }
            }
        }
    }
});
