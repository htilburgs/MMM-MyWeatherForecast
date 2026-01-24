const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-MyWeatherForecast helper started...");
        this.cache = null; // last successful weather
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { apiKey, userlat, userlon, units, lang } = payload;

            const url = `https://api.pirateweather.net/forecast/${apiKey}/${userlat},${userlon}?units=${units}&lang=${lang}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();

                this.cache = data;
                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("MMM-MyWeatherForecast fetch error:", err);

                if (this.cache) {
                    console.warn("Sending cached weather data due to API failure.");
                    this.sendSocketNotification("WEATHER_RESULT", this.cache);
                } else {
                    this.sendSocketNotification("WEATHER_ERROR", err.message);
                }
            }
        }
    }
});
