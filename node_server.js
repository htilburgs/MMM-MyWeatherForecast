const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get("/weather", async (req, res) => {
    const { lat, lon, apikey, lang = "en" } = req.query;

    if (!lat || !lon || !apikey) {
        return res.status(400).json({ error: "Missing lat, lon or apikey" });
    }

    try {
        const url = `https://api.piratesky.com/weather?lat=${lat}&lon=${lon}&apikey=${apikey}&lang=${lang}`;
        const response = await fetch(url);

        if (!response.ok) return res.status(response.status).json({ error: "PirateSky API error" });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Node server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`MMM-MyWeatherForecast Node server running on port ${PORT}`);
});
