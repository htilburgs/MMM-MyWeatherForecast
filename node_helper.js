const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-MyWeatherForecast helper started...");
        this.cache = null; // store last successful weather data
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { latitude, longitude, apiKey, lang } = payload;
            const url = `https://api.piratesky.com/weather?lat=${latitude}&lon=${longitude}&apikey=${apiKey}&lang=${lang}`;

            try {
                const response = await fetch(url);  // native Node 18+ fetch
                const data = await response.json();

                // cache successful result
                this.cache = data;

                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("MMM-MyWeatherForecast fetch error:", err);

                // if fetch fails, send cached data if available
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
