// Recommit to trigger Netlify deploy

const zipMap = require("./cityziplatlong.json");
const feedMap = require("./newsFeeds.json");
const Parser = require("rss-parser");
const parser = new Parser();

function findClosestZip(lat, lon, zipMap) {
  let closest = null;
  let minDist = Infinity;
  for (const zip in zipMap) {
    const { lat: zlat, lon: zlon } = zipMap[zip];
    const dist = Math.hypot(lat - zlat, lon - zlon);
    if (dist < minDist) {
      minDist = dist;
      closest = zip;
    }
  }
  return closest;
}

async function getHeadlines(city, zip, lat, lon, feedMap) {
  try {
    const response = await fetch('https://copilot-curate.netlify.app/.netlify/functions/editor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, zip, lat, lon })
    });

    const curated = await response.json();
    if (curated?.snippets?.length) {
      console.log("Copilot returned curated snippets.");
      return curated.snippets;
    } else {
      console.warn("Copilot returned no snippets. Falling back to feed.");
      return await getHeadlinesFromFeed(city, feedMap);
    }
  } catch (err) {
    console.error("Copilot curation failed:", err.message);
    return await getHeadlinesFromFeed(city, feedMap);
  }
}


exports.handler = async function(event) {
  try {
    const { lat, lon, zip } = event.queryStringParameters || {};
   // Inside exports.handler
console.log("Received query params:", { lat, lon, zip });
...
console.log("Calling Copilot with:", { city, zip, lat, lon });

// Inside getHeadlines()
const curated = await response.json();
console.log("Copilot response:", curated);


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
    const city = zipMap[closestZip]?.city || "default";
    if (city === "default") console.warn("Fallback to default feed");

    const cleanHeadlines = await getHeadlines(city, feedMap);

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
      body: JSON.stringify({
        error: "Failed to load headlines",
        details: err.message
      })
    };
  }
};
