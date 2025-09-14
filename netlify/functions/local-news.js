const zipMap = require("./cityziplatlong.json");
const getHeadlines = require("../../lib/getHeadlines");
const findClosestZip = require("../../lib/findClosestZip");

exports.handler = async function(event) {
  try {
    const { lat, lon, zip } = event.queryStringParameters || {};
    let latitude = parseFloat(lat);
    let longitude = parseFloat(lon);

    if (zip && (!latitude || !longitude)) {
      const entry = zipMap[zip];
      if (!entry) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid ZIP" }) };
      }
      latitude = entry.lat;
      longitude = entry.lon;
    }

    if (!latitude || !longitude) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing lat/lon or zip" }) };
    }

    const closestZip = findClosestZip(latitude, longitude, zipMap);
    const raw = await getHeadlines(closestZip, latitude, longitude, zipMap);
    const curated = raw.map(item => ({
      title: item.title || "",
      url: item.url || "",
      snippet: item.snippet || item.summary || item.description || item.text || ""
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(curated)
    };
  } catch (err) {
    console.error("local-news error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load local news" })
    };
  }
};
