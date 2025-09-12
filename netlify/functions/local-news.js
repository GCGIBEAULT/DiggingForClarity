const fs = require("fs");
const path = require("path");
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

async function getHeadlines(city, feedMap, visited = new Set()) {
  if (visited.has(city)) return []; // prevent infinite loops
  visited.add(city);

  const feeds = feedMap[city]?.feeds || [];
  const fallback = feedMap[city]?.fallback || "default";

  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      allItems.push(...(feed.items || []));
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }

  const headlines = allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 5)
    .map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.contentSnippet || ""
    }));

  if (headlines.length >= 3 || city === "default") return headlines;

  return await getHeadlines(fallback, feedMap, visited);
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
    const zipMapPath = path.join(__dirname, "cityziplatlong.json");
    const feedMapPath = path.join(__dirname, "newsFeeds.json");

    const zipMap = JSON.parse(fs.readFileSync(zipMapPath, "utf8"));
    const feedMap = JSON.parse(fs.readFileSync(feedMapPath, "utf8"));

    const closestZip = findClosestZip(latitude, longitude, zipMap);
    const city = zipMap[closestZip]?.city || "default";

    const headlines = await getHeadlines(city, feedMap);

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
};
