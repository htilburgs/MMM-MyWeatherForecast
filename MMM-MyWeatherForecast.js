Module.register("MMM-MyWeatherForecast", {
    defaults: {
        apiKey: "",
        userlat: "52.3676",
        userlon: "4.9041",
        units: "si",
        showForecast: true,
        showLastUpdate: true,
        showSunTimes: true,
        updateInterval: 10 * 60 * 1000,
        lang: "en" // Module-specific language
    },

    start: function() {
        this.weatherData = null;
        this.lastUpdate = null;
        this.moduleTranslations = {};

        // Load translation JSON manually
        const lang = this.config.lang || "en";
        fetch(`modules/MMM-MyWeatherForecast/translations/${lang}.json`)
            .then(res => res.json())
            .then(json => {
                this.moduleTranslations = json;
                this.updateDom();
            })
            .catch(err => console.error("Failed to load translations:", err));

        this.scheduleUpdate();
    },

    getStyles: function() {
        return ["MMM-MyWeatherForecast.css"];
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
            if (!payload || !payload.currently || !payload.daily) return;

            const today = new Date();
            if (payload.daily.data) {
                payload.daily.data.slice(1,5).forEach((day,index)=>{
                    const date = new Date(today);
                    date.setDate(today.getDate() + index + 1);
                    day.date = date.toISOString().split("T")[0];
                });
            }

            this.weatherData = payload;
            this.lastUpdate = new Date();
            this.updateDom(1000);
        } else if (notification === "WEATHER_ERROR") {
            console.error("[MMM-MyWeatherForecast] WEATHER_ERROR:", payload);
        }
    },

    translateModule: function(key) {
        return (this.moduleTranslations && this.moduleTranslations[key]) || key;
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
        const weekdayIndex = date.getDay();
        const weekdays = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
        return this.translateModule(weekdays[weekdayIndex]);
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "myweather-wrapper";

        if (!this.weatherData || !this.moduleTranslations || Object.keys(this.moduleTranslations).length === 0) {
            wrapper.innerHTML = this.translateModule("LOADING") || "Loading...";
            return wrapper;
        }

        const current = this.weatherData.currently;
        const forecast = this.weatherData.daily;

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
        temp.innerHTML = `${current.temperature.toFixed(1)}°`;

        const conditionText = document.createElement("div");
        conditionText.className = "current-condition";
        const iconKey = current.icon.toUpperCase();
        conditionText.innerHTML = this.translateModule(iconKey) || current.summary;

        details.appendChild(temp);
        details.appendChild(conditionText);
        currentDiv.appendChild(icon);
        currentDiv.appendChild(details);
        wrapper.appendChild(currentDiv);

        // Sunrise / Sunset
        if (this.config.showSunTimes && this.weatherData.daily.data) {
            const todayData = this.weatherData.daily.data[0];
            const sun = document.createElement("div");
            sun.className = "sun-times";
            const sunrise = new Date(todayData.sunriseTime * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            const sunset = new Date(todayData.sunsetTime * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            sun.innerHTML = `<span>${this.translateModule("SUNRISE")}: ${sunrise}</span> | <span>${this.translateModule("SUNSET")}: ${sunset}</span>`;
            wrapper.appendChild(sun);
        }

        // Forecast
        if (this.config.showForecast && forecast && forecast.data) {
            const forecastDiv = document.createElement("div");
            forecastDiv.className = "forecast-bar";

            forecast.data.slice(1,5).forEach(day => {
                const dayDiv = document.createElement("div");
                dayDiv.className = "forecast-day";

                const dayName = document.createElement("div");
                dayName.className = "forecast-day-name";
                dayName.innerHTML = this.getDayName(new Date(day.time*1000).toISOString());

                const dayIcon = document.createElement("img");
                dayIcon.src = this.getWeatherIcon(day.icon);
                dayIcon.className = "forecast-icon";

                const dayTemp = document.createElement("div");
                dayTemp.className = "forecast-temp";
                dayTemp.innerHTML = `${day.temperatureMin.toFixed(1)}° / ${day.temperatureMax.toFixed(1)}°`;

                dayDiv.appendChild(dayName);
                dayDiv.appendChild(dayIcon);
                dayDiv.appendChild(dayTemp);

                forecastDiv.appendChild(dayDiv);
            });

            wrapper.appendChild(forecastDiv);
        }

        // Last update
        if (this.config.showLastUpdate && this.lastUpdate) {
            const updateDiv = document.createElement("div");
            updateDiv.className = "last-update";
            updateDiv.style.textAlign = "right";
            updateDiv.innerHTML = `${this.translateModule("LAST_UPDATE")}: ${this.lastUpdate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
            wrapper.appendChild(updateDiv);
        }

        return wrapper;
    }
});
