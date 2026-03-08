const NodeHelper = require("node_helper");
const fetch = require("node-fetch"); // make sure node-fetch is installed

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-MyWeatherForecast helper started...");
        this.cache = null; // store last successful weather data
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { apiKey, userlat, userlon, units, lang } = payload;
            const url = `https://api.pirateweather.net/forecast/${apiKey}/${userlat},${userlon}?units=${units}&lang=${lang}`;
            // console.log("[MMM-MyWeatherForecast] Fetching URL:", url);

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();

                // save to cache
                this.cache = data;

                // send result to module
                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("[MMM-MyWeatherForecast] Fetch error:", err);

                if (this.cache) {
                    // send cached data if available
                    console.warn("[MMM-MyWeatherForecast] Sending cached weather data.");
                    this.sendSocketNotification("WEATHER_RESULT", this.cache);
                } else {
                    // no cached data available
                    this.sendSocketNotification("WEATHER_ERROR", err.message);
                }
            }
        }
    }
});
