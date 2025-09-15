const zipMap = require("./cityziplatlong.json");

function findClosestZip(lat, lon, zipMap) {
  let closestZip = null;
  let minDistance = Infinity;
  for (const z in zipMap) {
    const { lat: zLat, lon: zLon } = zipMap[z];
    const distance = Math.sqrt(Math.pow(lat - zLat, 2) + Math.pow(lon - zLon, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestZip = z;
    }
  }
  return closestZip;
}

async function getLocalNews(lat, lon) {
  try {
    const response = await fetch("/.netlify/functions/local-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon })
    });

    const news = await response.json();

    const container = document.getElementById("local-news");
    container.innerHTML = ""; // Clear previous content

    if (news.length === 0) {
      container.innerHTML = "<p>No local news available.</p>";
      return;
    }

    const ul = document.createElement("ul");
    news.forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.url;
      a.textContent = item.title;
      a.target = "_blank";
      li.appendChild(a);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  } catch (err) {
    console.error("Failed to load local news:", err);
  }
}


exports.handler = async function (event) {
  try {
    const { lat, lon } = JSON.parse(event.body);
    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing coordinates" })
      };
    }

    const zip = findClosestZip(lat, lon, zipMap);
    const city = zipMap[zip]?.city || "Unknown";

    const snippets = await fetchCopilot(city, zip, lat, lon);

    return {
      statusCode: 200,
      body: JSON.stringify(snippets)
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
