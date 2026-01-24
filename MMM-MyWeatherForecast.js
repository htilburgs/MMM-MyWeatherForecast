Module.register("MMM-MyWeatherForecast", {
    defaults: {
        apiKey: "",
        latitude: "52.3676",
        longitude: "4.9041",
        showForecast: true,
        updateInterval: 10 * 60 * 1000,
        lang: config.language || "en",
        showLastUpdate: true
    },

    start: function() {
        this.weatherData = null;
        this.lastUpdate = null;
        this.scheduleUpdate();
    },

    getStyles: function() {
        return ["MMM-MyWeatherForecast.css"];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            nl: "translations/nl.json",
            de: "translations/de.json",
            fr: "translations/fr.json"
        };
    },

    scheduleUpdate: function() {
        setInterval(() => this.fetchWeather(), this.config.updateInterval);
        this.fetchWeather();
    },

    fetchWeather: function() {
        this.sendSocketNotification("FETCH_WEATHER", {
            latitude: this.config.latitude,
            longitude: this.config.longitude,
            apiKey: this.config.apiKey,
            lang: this.config.lang
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "WEATHER_RESULT") {
            const today = new Date();
            if (payload.forecast) {
                payload.forecast.slice(0, 4).forEach((day, index) => {
                    const forecastDate = new Date(today);
                    forecastDate.setDate(today.getDate() + index + 1);
                    day.date = forecastDate.toISOString().split("T")[0];
                });
            }
            this.weatherData = payload;
            this.lastUpdate = new Date();
            this.updateDom(1000);
        } else if (notification === "WEATHER_ERROR") {
            console.error("MMM-MyWeatherForecast Error:", payload);
        }
    },

    getWeatherIcon: function(condition) {
        const map = {
            "Clear": "clear.png",
            "Clouds": "cloudy.png",
            "Rain": "rain.png",
            "Snow": "snow.png",
            "Thunderstorm": "thunderstorm.png",
            "Drizzle": "drizzle.png",
            "Mist": "mist.png"
        };
        return `modules/MMM-MyWeatherForecast/images/${map[condition] || "clear.png"}`;
    },

    getBackgroundGradient: function(condition, isForecast=false) {
        const gradients = {
            "Clear": "linear-gradient(to bottom, #fceabb, #f8b500)",
            "Clouds": "linear-gradient(to bottom, #d7d2cc, #304352)",
            "Rain": "linear-gradient(to bottom, #4e54c8, #8f94fb)",
            "Drizzle": "linear-gradient(to bottom, #4e54c8, #8f94fb)",
            "Thunderstorm": "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)",
            "Snow": "linear-gradient(to bottom, #e6e9f0, #eef1f5)",
            "Mist": "linear-gradient(to bottom, #757f9a, #d7dde8)"
        };
        let gradient = gradients[condition] || "linear-gradient(to bottom, #fceabb, #f8b500)";
        if (isForecast) gradient = gradient.replace(/rgba?\(([^)]+)\)/g, "rgba($1,0.6)");
        return gradient;
    },

    getDayName: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(this.config.lang, { weekday: 'short' });
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "myweather-wrapper";

        if (!this.weatherData) {
            wrapper.innerHTML = this.translate("LOADING");
            return wrapper;
        }

        const current = this.weatherData.current;
        const forecast = this.weatherData.forecast;

        wrapper.style.background = this.getBackgroundGradient(current.condition);
        wrapper.style.borderRadius = "15px";
        wrapper.style.padding = "15px";
        wrapper.style.color = "#fff";

        // Current weather
        const currentDiv = document.createElement("div");
        currentDiv.className = "current-weather";

        const icon = document.createElement("img");
        icon.src = this.getWeatherIcon(current.condition);
        icon.className = "current-icon";

        const details = document.createElement("div");
        details.className = "current-details";

        const temp = document.createElement("div");
        temp.className = "current-temp";
        temp.innerHTML = `${current.temperature}°C`;

        const conditionText = document.createElement("div");
        conditionText.className = "current-condition";
        conditionText.innerHTML = this.translate(current.condition.toUpperCase());

        const sun = document.createElement("div");
        sun.className = "sun-times";
        sun.innerHTML = `<span>${this.translate("SUNRISE")}: ${current.sunrise}</span> | <span>${this.translate("SUNSET")}: ${current.sunset}</span>`;

        details.appendChild(temp);
        details.appendChild(conditionText);
        details.appendChild(sun);

        currentDiv.appendChild(icon);
        currentDiv.appendChild(details);
        wrapper.appendChild(currentDiv);

        // Forecast
        if (this.config.showForecast && forecast) {
            const forecastDiv = document.createElement("div");
            forecastDiv.className = "forecast-bar";

            forecast.slice(0, 4).forEach(day => {
                const dayDiv = document.createElement("div");
                dayDiv.className = "forecast-day";
                dayDiv.style.background = this.getBackgroundGradient(day.condition, true);

                const dayName = document.createElement("div");
                dayName.className = "forecast-day-name";
                dayName.innerHTML = this.getDayName(day.date);

                const dayIcon = document.createElement("img");
                dayIcon.src = this.getWeatherIcon(day.condition);
                dayIcon.className = "forecast-icon";

                const dayTemp = document.createElement("div");
                dayTemp.className = "forecast-temp";
                dayTemp.innerHTML = `${day.min}° / ${day.max}°C`;

                dayDiv.appendChild(dayName);
                dayDiv.appendChild(dayIcon);
                dayDiv.appendChild(dayTemp);

                forecastDiv.appendChild(dayDiv);
            });

            wrapper.appendChild(forecastDiv);
        }

        // Last update timestamp
        if (this.config.showLastUpdate && this.lastUpdate) {
            const updateDiv = document.createElement("div");
            updateDiv.className = "last-update";
            updateDiv.innerHTML = `${this.translate("LAST_UPDATE")}: ${this.lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            wrapper.appendChild(updateDiv);
        }

        return wrapper;
    }
});
