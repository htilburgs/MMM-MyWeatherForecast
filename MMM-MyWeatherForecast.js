getDom: function() {
    const wrapper = document.createElement("div");
    wrapper.className = "myweather-wrapper";

    if (!this.weatherData) {
        wrapper.innerHTML = this.translateModule("LOADING");
        return wrapper;
    }

    const current = this.weatherData.currently;
    const forecast = this.weatherData.daily;

    // --- Current weather ---
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

    // --- Sunrise / Sunset ---
    if (this.config.showSunTimes && this.weatherData.daily.data) {
        const todayData = this.weatherData.daily.data[0];
        const sun = document.createElement("div");
        sun.className = "sun-times";
        const sunrise = new Date(todayData.sunriseTime * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const sunset = new Date(todayData.sunsetTime * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        sun.innerHTML = `<span>${this.translateModule("SUNRISE")}: ${sunrise}</span> | <span>${this.translateModule("SUNSET")}: ${sunset}</span>`;
        wrapper.appendChild(sun);
    }

    // --- Forecast header (translated) ---
    if (this.config.showForecast && forecast && forecast.data) {
        const forecastHeader = document.createElement("div");
        forecastHeader.className = "forecast-header";
        forecastHeader.innerHTML = this.translateModule("FORECAST"); // <-- translated header
        wrapper.appendChild(forecastHeader);

        // --- Forecast bar ---
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

    // --- Last update ---
    if (this.config.showLastUpdate && this.lastUpdate) {
        const updateDiv = document.createElement("div");
        updateDiv.className = "last-update";
        updateDiv.style.textAlign = "right";
        updateDiv.innerHTML = `${this.translateModule("LAST_UPDATE")}: ${this.lastUpdate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
        wrapper.appendChild(updateDiv);
    }

    return wrapper;
}
