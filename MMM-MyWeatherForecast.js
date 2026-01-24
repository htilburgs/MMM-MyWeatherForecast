// --- Forecast header ---
if (this.config.showForecast && forecast && forecast.data) {
    const forecastHeader = document.createElement("div");
    forecastHeader.className = "forecast-header";
    forecastHeader.innerHTML = this.translateModule("FORECAST");
    wrapper.appendChild(forecastHeader);

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
