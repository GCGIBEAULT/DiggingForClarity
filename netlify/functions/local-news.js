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
    const result = await response.json();
    return Array.isArray(result.snippets)
      ? result.snippets.filter(s => s.title && s.url)
      : [];
  } catch (err) {
    console.error("Copilot fetch failed:", err.message);
    return [];
  }
}

// Main logic: Get headlines from Copilot, fallback to county if needed
async function getHeadlines(zip, lat, lon, zipMap) {
  const city = zipMap[zip]?.city || "default";
  const county = zipMap[zip]?.county || "default";

  const localSnippets = await fetchCopilot(city, zip, lat, lon);
  if (localSnippets.length === 7) return localSnippets;

  const countySnippets = await fetchCopilot(county, zip, lat, lon);
  const combined = [...localSnippets, ...countySnippets].slice(0, 7);

  console.log(`[${new Date().toISOString()}] Returning ${combined.length} snippets`);
  return combined;
}

// Netlify handler
exports.handler = async function (event) {
  try {
    const { lat, lon, zip } = event.queryStringParameters || {};
    let latitude = parseFloat(lat);
    let longitude = parseFloat(lon);

    const zipCode = findClosestZip(latitude, longitude, zipMap);
    const headlines = await getHeadlines(zipCode, latitude, longitude, zipMap);

    // 🔍 Add these logs right here
    console.log("ZIP:", zipCode);
    console.log("Headlines:", headlines);

    return {
      statusCode: 200,
      body: JSON.stringify(headlines)
    };
  } catch (err) {
    console.error("Handler error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};


