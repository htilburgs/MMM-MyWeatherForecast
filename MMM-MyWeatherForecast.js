Module.register("MMM-MyWeatherForecast", {

    defaults: {
        apiKey: "",
        latitude: "52.3676",
        longitude: "4.9041",
        units: "metric", // metric | imperial
        iconSet: "standard", // standard | outline | animated
        showForecast: true,
        showLastUpdate: true,
        showSunTimes: true,
        updateInterval: 10 * 60 * 1000,
        lang: "en"
    },

    start: function () {
        this.weatherData = null;
        this.lastUpdate = null;
        this.moduleTranslations = {};

        const lang = this.config.lang || "en";
        fetch(`modules/MMM-MyWeatherForecast/translations/${lang}.json`)
            .then(res => res.json())
            .then(json => {
                this.moduleTranslations = json;
                this.updateDom();
            })
            .catch(err => {
                console.error("[MMM-MyWeatherForecast] Translation load failed:", err);
            });

        this.scheduleUpdate();
    },

    getStyles: function () {
        return ["MMM-MyWeatherForecast.css"];
    },

    /* -------------------- API HELPERS -------------------- */

    getApiUnits: function () {
        return this.config.units === "imperial" ? "us" : "si";
    },

    getTempUnit: function () {
        return this.config.units === "imperial" ? "°F" : "°C";
    },

    scheduleUpdate: function () {
        this.fetchWeather();
        setInterval(() => this.fetchWeather(), this.config.updateInterval);
    },

    fetchWeather: function () {
        this.sendSocketNotification("FETCH_WEATHER", {
            apiKey: this.config.apiKey,
            userlat: this.config.latitude,
            userlon: this.config.longitude,
            units: this.getApiUnits(),
            lang: this.config.lang
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "WEATHER_RESULT") {
            if (!payload || !payload.currently || !payload.daily) return;

            this.weatherData = payload;
            this.lastUpdate = new Date();
            this.updateDom(1000);
        }

        if (notification === "WEATHER_ERROR") {
            console.error("[MMM-MyWeatherForecast] WEATHER_ERROR:", payload);
        }
    },

    /* -------------------- TRANSLATION -------------------- */

    translateModule: function (key) {
        return this.moduleTranslations[key] || key;
    },

    /* -------------------- ICON SYSTEM -------------------- */

    getIconMaps: function () {
        return {
            standard: {
                "clear-day": "clear.png",
                "partly-cloudy-day": "partly-cloudy.png",
                "partly-cloudy-night": "partly-cloudy-night.png",
                "cloudy": "cloudy.png",
                "rain": "rain.png",
                "snow": "snow.png",
                "sleet": "snow.png",
                "wind": "drizzle.png",
                "fog": "mist.png",
                "thunderstorm": "thunderstorm.png",
                "drizzle": "drizzle.png",
                "mist": "mist.png"
            },

            outline: {
                "clear-day": "sun-outline.png",
                "clear-night": "moon-outline.png",
                "partly-cloudy-day": "cloud-sun-outline.png",
                "partly-cloudy-night": "cloud-moon-outline.png",
                "cloudy": "cloud-outline.png",
                "rain": "rain-outline.png",
                "snow": "snow-outline.png",
                "thunderstorm": "storm-outline.png",
                "fog": "fog-outline.png"
            },

            animated: {
                "clear-day": "clear-day.svg",
                "clear-night": "clear-night.svg",
                "partly-cloudy-day": "partly-cloudy-day.svg",
                "partly-cloudy-night": "partly-cloudy-night.svg",
                "cloudy": "cloudy.svg",
                "drizzle": "drizzle.svg",
                "rain": "rain.svg",
                "snow": "snow.svg",
                "mist": "mist.svg",
                "thunderstorm": "thunderstorm.svg"
            }
        };
    },

    getWeatherIcon: function (condition) {
        const iconSet = this.config.iconSet || "standard";
        const maps = this.getIconMaps();

        const setMap = maps[iconSet] || maps.standard;
        const iconFile =
            setMap[condition] ||
            maps.standard[condition] ||
            "clear.png";

        return `modules/MMM-MyWeatherForecast/images/${iconSet}/${iconFile}`;
    },

    /* -------------------- DATE HELPERS -------------------- */

    getDayName: function (timestamp) {
        const date = new Date(timestamp * 1000);
        const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return this.translateModule(weekdays[date.getDay()]);
    },

    /* -------------------- DOM -------------------- */

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "myweather-wrapper";

        if (!this.weatherData || Object.keys(this.moduleTranslations).length === 0) {
            wrapper.innerHTML = this.translateModule("LOADING");
            return wrapper;
        }

        const current = this.weatherData.currently;
        const forecast = this.weatherData.daily;

        /* ---- Current Weather ---- */
        const currentDiv = document.createElement("div");
        currentDiv.className = "current-weather";

        const icon = document.createElement("img");
        icon.className = "current-icon";
        icon.src = this.getWeatherIcon(current.icon);

        const details = document.createElement("div");
        details.className = "current-details";

        const temp = document.createElement("div");
        temp.className = "current-temp";
        temp.innerHTML = `${current.temperature.toFixed(1)}${this.getTempUnit()}`;

        const condition = document.createElement("div");
        condition.className = "current-condition";
        condition.innerHTML =
            this.translateModule(current.icon.toUpperCase()) || current.summary;

        details.appendChild(temp);
        details.appendChild(condition);
        currentDiv.appendChild(icon);
        currentDiv.appendChild(details);
        wrapper.appendChild(currentDiv);

        /* ---- Sun Times ---- */
        if (this.config.showSunTimes && forecast?.data?.length) {
            const today = forecast.data[0];
            const sunDiv = document.createElement("div");
            sunDiv.className = "sun-times";

            const sunrise = new Date(today.sunriseTime * 1000)
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            const sunset = new Date(today.sunsetTime * 1000)
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            sunDiv.innerHTML = `
                <span>${this.translateModule("SUNRISE")}: ${sunrise}</span>
                |
                <span>${this.translateModule("SUNSET")}: ${sunset}</span>
            `;

            wrapper.appendChild(sunDiv);
        }

        /* ---- Forecast ---- */
        if (this.config.showForecast && forecast?.data?.length) {
            const header = document.createElement("div");
            header.className = "forecast-header";
            header.innerHTML = this.translateModule("FORECAST_4_DAYS");
            wrapper.appendChild(header);

            const bar = document.createElement("div");
            bar.className = "forecast-bar";

            forecast.data.slice(1, 5).forEach(day => {
                const dayDiv = document.createElement("div");
                dayDiv.className = "forecast-day";

                const name = document.createElement("div");
                name.className = "forecast-day-name";
                name.innerHTML = this.getDayName(day.time);

                const icon = document.createElement("img");
                icon.className = "forecast-icon";
                icon.src = this.getWeatherIcon(day.icon);

                const temp = document.createElement("div");
                temp.className = "forecast-temp";
                temp.innerHTML = `
                    ${day.temperatureMin.toFixed(1)}${this.getTempUnit()}
                    /
                    ${day.temperatureMax.toFixed(1)}${this.getTempUnit()}
                `;

                dayDiv.appendChild(name);
                dayDiv.appendChild(icon);
                dayDiv.appendChild(temp);
                bar.appendChild(dayDiv);
            });

            wrapper.appendChild(bar);
        }

        /* ---- Last Update ---- */
        if (this.config.showLastUpdate && this.lastUpdate) {
            const update = document.createElement("div");
            update.className = "last-update";
            update.innerHTML = `
                ${this.translateModule("LAST_UPDATE")}:
                ${this.lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            `;
            wrapper.appendChild(update);
        }

        return wrapper;
    }
});
