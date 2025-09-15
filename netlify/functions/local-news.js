const zipMap = require("./cityziplatlong.json");

function findClosestZip(lat, lon, zipMap) {
  let closestZip = null;
  let minDistance = Infinity;
  for (const z in zipMap) {
    const { lat: zLat, lon: zLon } = zipMap[z];
    const distance = Math.sqrt(
      Math.pow(lat - zLat, 2) + Math.pow(lon - zLon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestZip = z;
    }
  }
  return closestZip;
}

async function fetchCopilot(location, zip, lat, lon) {
  try {
    const response = await fetch(
      "https://copilot-curate.netlify.app/.netlify/functions/editor",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: location, zip, lat, lon })
      }
    );
    const result = await response.json();
    return Array.isArray(result.snippets)
      ? result.snippets.filter(s => s.title).slice(0, 7)
      : [];
  } catch (err) {
    console.error("Copilot fetch failed:", err.message);
    return [];
  }
}

async function getHeadlines(zip, lat, lon, zipMap) {
  const city = zipMap[zip]?.city || "default";
  const county = zipMap[zip]?.county || "default";
  const localSnippets = await fetchCopilot(city, zip, lat, lon);
  if (localSnippets.length === 7) return localSnippets;
  const countySnippets = await fetchCopilot(county, zip, lat, lon);
  const combined = [...localSnippets, ...countySnippets].slice(0, 7);
  console.log(
    `[${new Date().toISOString()}] Returning ${combined.length} snippets`
  );
  return combined;
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

   
