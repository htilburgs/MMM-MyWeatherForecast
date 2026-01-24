Module.register("MMM-MyWeatherForecast", {
    defaults: {
        apiKey: "",
        userlat: "52.3676",
        userlon: "4.9041",
        units: "si",
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
            apiKey: this.config.apiKey,
            userlat: this.config.userlat,
            userlon: this.config.userlon,
            units: this.config.units,
            lang: this.config.lang
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "WEATHER_RESULT") {
            if (!payload || !payload.currently || !payload.daily) {
                console.error("[MMM-MyWeatherForecast] Invalid weather data:", payload);
                return;
            }

            const today = new Date();

            // Prepare next 4 days forecast
            if (payload.daily.data) {
                payload.daily.data.slice(1,5).forEach((day, index) => {
                    const forecastDate = new Date(today);
                    forecastDate.setDate(today.getDate() + index + 1);
                    day.date = forecastDate.toISOString().split("T")[0];
                });
            }

            this.weatherData = payload;
            this.lastUpdate = new Date();
            this.updateDom(1000);

        } else if (notification === "WEATHER_ERROR") {
            console.error("[MMM-MyWeatherForecast] WEATHER_ERROR:", payload);
        }
    },

    getWeatherIcon: function(condition) {
        const map = {
            "clear-day": "clear.png",
            "clear-night": "clear.png",
            "partly-cloudy-day": "cloudy.png",
            "partly-cloudy-night": "cloudy.png",
            "cloudy": "cloudy.png",
            "rain": "rain.png",
            "snow": "snow.png",
            "sleet": "snow.png",
            "wind": "drizzle.png",
            "fog": "mist.png",
            "thunderstorm": "thunderstorm.png",
            "drizzle": "drizzle.png",
            "mist": "mist.png"
        };
        return `modules/MMM-MyWeatherForecast/images/${map[condition] || "clear.png"}`;
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

        const current = this.weatherData.currently;
        const forecast = this.weatherData.daily;

        wrapper.style.borderRadius = "15px";
        wrapper.style.padding = "15px";
        wrapper.style.color = "#fff";

        // Current weather
        const currentDiv = document.createElement("div");
        currentDiv.className = "current-weather";

        const icon = document.createElement("img");
        icon.src = this.getWeatherIcon(current.icon);
        icon.className = "current-icon";

        const details = document.createElement("div");
        details.className = "current-details";

        const temp = document.createElement("div");
        temp.className = "current-temp";
        temp.innerHTML = `${current.temperature}°`;

        const conditionText = document.createElement("div");
        conditionText.className = "current-condition";
        conditionText.innerHTML = this.translate(current.icon.toUpperCase()) || current.summary;

        const sun = document.createElement("div");
        sun.className = "sun-times";
        if (this.weatherData.daily.data) {
            const todayData = this.weatherData.daily.data[0];
            const sunrise = new Date(todayData.sunriseTime * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            const sunset = new Date(todayData.sunsetTime * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            sun.innerHTML = `<span>${this.translate("SUNRISE")}: ${sunrise}</span> | <span>${this.translate("SUNSET")}: ${sunset}</span>`;
        }

        details.appendChild(temp);
        details.appendChild(conditionText);
        details.appendChild(sun);

        currentDiv.appendChild(icon);
        currentDiv.appendChild(details);
        wrapper.appendChild(currentDiv);

        // Forecast
        if (this.config.showForecast && forecast && forecast.data) {
            const forecastDiv = document.createElement("div");
            forecastDiv.className = "forecast-bar";

            forecast.data.slice(1,5).forEach(day => {
                const dayDiv = document.createElement("div");
                dayDiv.className = "forecast-day";
                // No background colors

                const dayName = document.createElement("div");
                dayName.className = "forecast-day-name";
                dayName.innerHTML = this.getDayName(new Date(day.time * 1000).toISOString());

                const dayIcon = document.createElement("img");
                dayIcon.src = this.getWeatherIcon(day.icon);
                dayIcon.className = "forecast-icon";

                const dayTemp = document.createElement("div");
                dayTemp.className = "forecast-temp";
                dayTemp.innerHTML = `${day.temperatureMin}° / ${day.temperatureMax}°`;

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
            updateDiv.innerHTML = `${this.translate("LAST_UPDATE")}: ${this.lastUpdate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
            wrapper.appendChild(updateDiv);
        }

        return wrapper;
    }
});
