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

async function fetchCopilot(location, zip, lat, lon) {
  try {
    const response = await fetch("https://copilot-curate.netlify.app/.netlify/functions/editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: location, zip, lat, lon })
    });

    const result = await response.json();

    return Array.isArray(result.snippets)
      ? result.snippets
          .filter(s => s.title && !/sports|football|basketball|playoff|mlb|nba|wnba|soccer|tennis|golf|hockey/i.test(s.title))
          .slice(0, 7)
      : [];
  } catch (err) {
    console.error("Copilot fetch failed:", err.message);
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
    const snippets = await fetchCopilot(zipMap[zip]?.city || "Unknown", zip, lat, lon);

    return {
      statusCode: 200,
      body: JSON.stringify(snippets)
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};

   
