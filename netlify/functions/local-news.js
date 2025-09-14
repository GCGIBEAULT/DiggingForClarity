const zipMap = require("./cityziplatlong.json");

// Helper: Find closest ZIP based on lat/lon
function findClosestZip(lat, lon, zipMap) {
  let closestZip = null;
  let minDistance = Infinity;
  for (const zip in zipMap) {
    const { lat: zLat, lon: zLon } = zipMap[zip];
    const distance = Math.sqrt(Math.pow(lat - zLat, 2) + Math.pow(lon - zLon, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestZip = zip;
    }
  }
  return closestZip;
}

// Helper: Call Copilot curation endpoint
async function fetchCopilot(location, zip, lat, lon) {
  try {
    const response = await fetch("https://copilot-curate.netlify.app/.netlify/functions/editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: location, zip, lat, lon })
    });
    return await response.json();
  } catch (err) {
    console.error("Copilot fetch failed:", err.message);
    return { snippets: [] };
  }
}

// Main logic: Get headlines from Copilot, fallback to county if needed
async function getHeadlines(zip, lat, lon, zipMap) {
  const city = zipMap[zip]?.city || "default";
  const county = zipMap[zip]?.county || "default";

  const local = await fetchCopilot(city, zip, lat, lon);
  const localSnippets = local.snippets || [];

  if (localSnippets.length === 7) {
    return localSnippets;
  }

  const countyResponse = await fetchCopilot(county, zip, lat, lon);
  const countySnippets = countyResponse.snippets || [];

  const combined = [...localSnippets, ...countySnippets].slice(0, 7);
  console.log(`[${new Date().toISOString()}] Returning ${combined.length} snippets: ${localSnippets.length} local, ${combined.length - localSnippets.length} county`);
  return combined;
}

// Netlify handler
exports.handler = async function(event) {
  try {
    const { lat, lon, zip } = event.queryStringParameters || {};
    console.log("Received query params:", { lat, lon, zip });

    let latitude = lat;
    let longitude = lon;

    if (zip && (!lat || !lon)) {
      if (zipMap[zip]) {
        latitude = zipMap[zip].lat;
        longitude = zipMap[zip].lon;
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid ZIP code" })
        };
      }
    }

    if (!latitude || !longitude) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing lat/lon" })
      };
    }

    const closestZip = findClosestZip(parseFloat(latitude), parseFloat(longitude), zipMap);
    const cleanHeadlines = await getHeadlines(closestZip, latitude, longitude, zipMap);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cleanHeadlines)
    };
  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load headlines" })
    };
  }
};
