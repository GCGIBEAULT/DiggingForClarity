const zipMap = require("./cityziplatlong.json");
const getHeadlines = require("../lib/getHeadlines");
const findClosestZip = require("../lib/findClosestZip");

exports.handler = async function(event) {
  try {
    const { lat, lon, zip } = event.queryStringParameters || {};
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

    const closestZip = findClosestZip(
      parseFloat(latitude),
      parseFloat(longitude),
      zipMap
    );

    const rawSnippets = await getHeadlines(
      closestZip,
      latitude,
      longitude,
      zipMap
    );

    const curated = rawSnippets.map(
      ({ title, url, summary, description, text }) => ({
        title,
        url,
        snippet: summary || description || text || ""
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(curated)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load headlines" })
    };
  }
};
