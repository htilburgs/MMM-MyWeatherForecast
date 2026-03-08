const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-MyWeatherForecast helper started...");
        this.cache = null; // Store last successful weather data
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { apiKey, userlat, userlon, units, lang } = payload;
            const url = `https://api.pirateweather.net/forecast/${apiKey}/${userlat},${userlon}?units=${units}&lang=${lang}`;

            try {
                // Use the global fetch available in Node 18+
                const response = await fetch(url);

                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();

                // Save to cache
                this.cache = data;

                // Send result to module
                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("[MMM-MyWeatherForecast] Fetch error:", err);

                if (this.cache) {
                    // Send cached data if available
                    console.warn("[MMM-MyWeatherForecast] Sending cached weather data.");
                    this.sendSocketNotification("WEATHER_RESULT", this.cache);
                } else {
                    // No cached data available
                    this.sendSocketNotification("WEATHER_ERROR", err.message);
                }
            }
        }
    }
});
