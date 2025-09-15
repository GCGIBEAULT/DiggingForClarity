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

async function fetchCopilot(city, zip, lat, lon) {
  try {
    const response = await fetch("https://copilot-curate.netlify.app/.netlify/functions/editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, zip, lat, lon })
    });

    const result = await response.json();

    // Filter out empty or malformed snippets
    return Array.isArray(result.snippets)
      ? result.snippets.filter(s => typeof s.title === "string" && s.title.trim() && typeof s.url === "string" && s.url.trim()).slice(0, 7)
      : [];
  } catch {
    return [];
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
