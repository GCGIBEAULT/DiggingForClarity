
 const fs = require("fs");
const path = require("path");

function findClosestCounty(lat, lon, countyMap) {
  let closest = null;
  let minDistance = Infinity;

for (const county in countyMap) {
  const coords = countyMap[county];
  if (!Array.isArray(coords) || coords.length !== 2) continue;

  const [clat, clon] = coords;
  const distance = Math.sqrt((lat - clat) ** 2 + (lon - clon) ** 2);
  if (distance < minDistance) {
    minDistance = distance;
    closest = county;
  }
}

  return closest;
}

exports.handler = async (event) => {
  const { lat, lon } = event.queryStringParameters;

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing lat/lon" })
    };
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  try {
    const countyMapPath = path.join(__dirname, "cityzip.json");
    const countyMap = JSON.parse(fs.readFileSync(countyMapPath, "utf8"));

    const closestCounty = findClosestCounty(latitude, longitude, countyMap);

    if (!closestCounty) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No matching county found" })
      };
    }

  const headlinesMap = {
  denver: [
    {
      title: "Denver expands community garden program",
      url: "https://example.com",
      snippet: "Local news for Denver will appear here."
    }
  ],
  default: [
    {
      title: "National news placeholder",
      url: "https://example.com",
      snippet: "Fallback headlines for unsupported locations."
    }
  ]
};

const headlines = headlinesMap[closestCounty] || headlinesMap["default"];


    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(headlines)
    };
} catch (err) {
  console.error("Local news function error:", err.message);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Failed to load headlines", details: err.message })
  };
}

