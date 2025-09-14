exports.handler = async function (event) {
  // Parse incoming request body
  const { city, zip, lat, lon } = JSON.parse(event.body || "{}");

  // ✅ Log the incoming payload
  console.log(`[${new Date().toISOString()}] Incoming payload:`, { city, zip, lat, lon });

  // Sample snippets (static for now)
  const snippets = [
    { title: "Local park reopens after renovations" },
    { title: "City council approves new housing plan" },
    { title: "Farmers market expands weekend hours" },
    { title: "New bike lanes added downtown" },
    { title: "Library launches fall reading program" },
    { title: "Local artist featured in gallery show" },
    { title: "Community cleanup scheduled Saturday" }
  ];

  // ✅ Log the number of snippets being returned
  console.log(`[${new Date().toISOString()}] Returning ${snippets.length} snippets`);

  // Return the response
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ snippets })
  };
};
document.addEventListener("DOMContentLoaded", () => {
  const wBtn = document.getElementById("saveWeather");
  if (wBtn) {
    wBtn.addEventListener("click", () => {
      const url = document.getElementById("weatherURL").value.trim();
      if (!url) return;
      localStorage.setItem("userWeatherURL", url);
      document.getElementById("twc-anchor").innerHTML =
        `<a href="${url}" target="_blank" style="color:#111; text-decoration:none; font-weight:bold;">View Forecast</a>`;
    });

    const saved = localStorage.getItem("userWeatherURL");
    if (saved) {
      document.getElementById("twc-anchor").innerHTML = `
        <a href="${saved}" target="_blank" style="color: #0645AD; text-decoration: underline; font-weight: bold;">View Forecast</a>
        &nbsp;&nbsp;
        <a href="https://weather.com" target="_blank" style="color: #0645AD; text-decoration: underline; font-weight: bold;">The Weather Channel</a>
      `;
    }
  }

  const tBtn = document.getElementById("saveTraffic");
  if (tBtn) {
    tBtn.addEventListener("click", () => {
      const url = document.getElementById("trafficURL").value.trim();
      if (!url) return;
      localStorage.setItem("userTrafficURL", url);
      document.getElementById("traffic-anchor").href = url;
    });

    const saved = localStorage.getItem("userTrafficURL");
    if (saved) {
      document.getElementById("traffic-anchor").href = saved;
    }
  }
});


