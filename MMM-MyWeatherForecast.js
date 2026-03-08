Module.register("MMM-MyWeatherForecast", {
    defaults: {
        apiKey: "",
        latitude: "52.3676",
        longitude: "4.9041",
        units: "metric",
        iconSet: "standard", // standard | animated
        showForecast: true,
        showLastUpdate: true,
        showSunTimes: true,
        updateInterval: 10 * 60 * 1000,
        lang: null // null = automatic MagicMirror language
    },

    start() {
        this.weatherData = null;
        this.lastUpdate = null;
        this.moduleTranslations = {};

        this.loadTranslations();
        this.scheduleUpdate();
    },

    getStyles() {
        return ["MMM-MyWeatherForecast.css"];
    },

    /* -------------------- TRANSLATIONS -------------------- */
    loadTranslations() {
        const lang = this.config.lang || (window?.MM?.config?.language) || "en";
        fetch(this.file(`translations/${lang}.json`))
            .then(res => {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(json => {
                this.moduleTranslations = json;
                this.updateDom();
            })
            .catch(err => {
                console.error("[MMM-MyWeatherForecast] Translation load failed:", err);
                this.moduleTranslations = {};
                this.updateDom();
            });
    },

    translate(key) {
        return this.moduleTranslations[key] || key;
    },

    getTranslationKey(icon) {
        return icon.toUpperCase(); // optional: matches translation JSON keys
    },

    /* -------------------- ICONS -------------------- */
    getWeatherIcon(icon) {
        const folder = this.config.iconSet || "standard";
        const ext = folder === "animated" ? "svg" : "png";
        return `modules/MMM-MyWeatherForecast/images/${folder}/${icon}.${ext}`;
    },

    /* -------------------- API HELPERS -------------------- */
    getApiUnits() { return this.config.units === "imperial" ? "us" : "si"; },
    getTempUnit() { return this.config.units === "imperial" ? "°F" : "°C"; },

    scheduleUpdate() {
        this.fetchWeather();
        setInterval(() => this.fetchWeather(), this.config.updateInterval);
    },

    fetchWeather() {
        // Automatic language detection: module lang or MagicMirror global language
        const lang = this.config.lang || (window?.MM?.config?.language) || "en";

        this.sendSocketNotification("FETCH_WEATHER", {
            apiKey: this.config.apiKey,
            userlat: this.config.latitude,
            userlon: this.config.longitude,
            units: this.getApiUnits(),
            lang: lang
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "WEATHER_RESULT" && payload?.currently && payload?.daily) {
            this.weatherData = payload;
            this.lastUpdate = new Date();
            this.updateDom(1000);
        } else if (notification === "WEATHER_ERROR") {
            console.error("[MMM-MyWeatherForecast] WEATHER_ERROR:", payload);
        }
    },

    getDayName(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString(
            this.config.lang || (window?.MM?.config?.language) || "en",
            { weekday: "short" }
        ).toUpperCase();
    },

    /* -------------------- DOM HELPERS -------------------- */
    createDiv(className, innerHTML = "") {
        const div = document.createElement("div");
        div.className = className;
        div.innerHTML = innerHTML;
        return div;
    },

    createImg(className, src) {
        const img = document.createElement("img");
        img.className = className;
        img.src = src;
        return img;
    },

    getDom() {
        const wrapper = this.createDiv("myweather-wrapper");

        if (!this.weatherData || !Object.keys(this.moduleTranslations).length) {
            wrapper.innerHTML = this.translate("LOADING");
            return wrapper;
        }

        const { currently, daily } = this.weatherData;

        // Current Weather
        const currentDiv = this.createDiv("current-weather");
        const icon = this.createImg("current-icon", this.getWeatherIcon(currently.icon));
        const details = this.createDiv("current-details");
        details.appendChild(this.createDiv("current-temp", `${currently.temperature.toFixed(1)}${this.getTempUnit()}`));
        const translationKey = this.getTranslationKey(currently.icon);
        details.appendChild(this.createDiv("current-condition", translationKey ? this.translate(translationKey) : currently.summary));
        currentDiv.appendChild(icon);
        currentDiv.appendChild(details);
        wrapper.appendChild(currentDiv);

        // Sun Times
        if (this.config.showSunTimes && daily?.data?.[0]) {
            const today = daily.data[0];
            const sunrise = new Date(today.sunriseTime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const sunset = new Date(today.sunsetTime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            wrapper.appendChild(this.createDiv("sun-times", `<span>${this.translate("SUNRISE")}: ${sunrise}</span> | <span>${this.translate("SUNSET")}: ${sunset}</span>`));
        }

        // Forecast
        if (this.config.showForecast && daily?.data?.length > 1) {
            wrapper.appendChild(this.createDiv("forecast-header", this.translate("FORECAST_4_DAYS")));
            const bar = this.createDiv("forecast-bar");
            daily.data.slice(1, 5).forEach(day => {
                const dayDiv = this.createDiv("forecast-day");
                dayDiv.appendChild(this.createDiv("forecast-day-name", this.getDayName(day.time)));
                dayDiv.appendChild(this.createImg("forecast-icon", this.getWeatherIcon(day.icon)));
                dayDiv.appendChild(this.createDiv("forecast-temp", `${day.temperatureMin.toFixed(1)}${this.getTempUnit()} / ${day.temperatureMax.toFixed(1)}${this.getTempUnit()}`));
                bar.appendChild(dayDiv);
            });
            wrapper.appendChild(bar);
        }

        // Last Update
        if (this.config.showLastUpdate && this.lastUpdate) {
            wrapper.appendChild(this.createDiv("last-update", `${this.translate("LAST_UPDATE")}: ${this.lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`));
        }

        return wrapper;
    }
});
