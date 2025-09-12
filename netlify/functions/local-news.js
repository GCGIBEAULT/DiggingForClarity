// Recommit to trigger Netlify deploy

const Parser = require("rss-parser");
const parser = new Parser();

// Load your lookup maps
const zipMap  = require("./cityziplatlong.json");
const feedMap = require("./newsFeeds.json");

/**
 * Find the closest ZIP code in zipMap to the given latitude/longitude.
 */
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

/**
 * Fetch, parse, sort, and filter headlines for a given city.
 */
async function getHeadlines(city, feedMap) {
  let feeds = feedMap[city]?.feeds || [];

  // If fallback to “default,” suppress commercial feeds
  if (city === "default") {
    const suppressed = feeds.filter(url => {
      const tag = Object.values(feedMap)
        .find(cfg => cfg.feeds?.includes(url))
        ?.neutralityTag;
      return tag === "commercial";
    });
    feeds = feeds.filter(url => !suppressed.includes(url));
  }

  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      allItems.push(...(feed.items || []));
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }

  const baitWords = [
    "shocking","devastating","furious",
    "heartbreaking","explosive","slams",
    "rips","chaos","meltdown"
  ];

  return allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10)
    .map(item => ({
      title:   item.title,
      url:     item.link,
      snippet: item.contentSnippet || ""
    }))
    .filter(item => {
      const txt       = `${item.title} ${item.snippet}`.toLowerCase();
      const isBait    = baitWords.some(w => txt.includes(w));
      const isAllCaps = item.title === item.title.toUpperCase();
      const hasExcl   = item.title.includes("!");
      const isShort   = item.title.trim().split(/\s+/).length < 5;
      return !isBait && !isAllCaps && !hasExcl && !isShort;
    });
}

/**
 * Netlify Function entry point.
 */
exports.handler = async (event) => {
  const { lat, lon } = event.queryStringParameters || {};
  console.log(`Received lat=${lat} lon=${lon}`);

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing lat/lon" })
    };
  }

  const latitude  = parseFloat(lat);
  const longitude = parseFloat(lon);

  try {
    const closestZip = findClosestZip(latitude, longitude, zipMap);
    const city       = zipMap[closestZip]?.city || "default";
    if (city === "default") console.warn("Fallback to default feed");

    const cleanHeadlines = await getHeadlines(city, feedMap);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type":                "application/json"
      },
      body: JSON.stringify(cleanHeadlines)
    };

  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:   "Failed to load headlines",
        details: err.message
      })
    };
  }
};
