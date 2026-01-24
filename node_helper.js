const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-MyWeatherForecast helper started...");
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "FETCH_WEATHER") {
            const { latitude, longitude, apiKey, lang } = payload;

            const url = `https://api.piratesky.com/weather?lat=${latitude}&lon=${longitude}&apikey=${apiKey}&lang=${lang}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                this.sendSocketNotification("WEATHER_RESULT", data);
            } catch (err) {
                console.error("MMM-MyWeatherForecast fetch error:", err);
                this.sendSocketNotification("WEATHER_ERROR", err.message);
            }
        }
    }
});
