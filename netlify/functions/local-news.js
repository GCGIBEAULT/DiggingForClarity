const zipMap = require("./cityziplatlong.json");
const getHeadlines = require("../lib/getHeadlines");
const findClosestZip = require("../lib/findClosestZip");

exports.handler = async function(event) {
  const { lat, lon, zip } = event.queryStringParameters || {};
  let latitude = lat;
  let longitude = lon;

  if (zip && (!lat || !lon)) {
    const entry = zipMap[zip];
    if (!entry) return { statusCode: 400, body: JSON.stringify({ error: "Invalid ZIP" }) };
    latitude = entry.lat;
    longitude = entry.lon;
  }

  if (!latitude || !longitude) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing lat/lon or zip" }) };
  }

  const closestZip = findClosestZip(
    parseFloat(latitude),
    parseFloat(longitude),
    zipMap
  );

  const local = await getHeadlines(
    closestZip,
    latitude,
    longitude,
    zipMap
  );

  console.log("Raw local snippets:", local);

  const curated = local.map(item => ({
    title: item.title || "",
    url: item.url || "",
    snippet: item.summary || item.description || item.text || ""
  }));

  console.log("Curated snippets:", curated);

  return {
    statusCode: 200,
    body: JSON.stringify(curated)
  };
};
