const fs     = require("fs");
const path   = require("path");
const Parser = require("rss-parser");
const parser = new Parser();

/**
 * Find the closest ZIP code in zipMap to the given lat/lon.
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
  console.log(`Trust score for ${city}: ${feedMap[city]?.trustScore || "N/A"}`);

  // 1. Select feeds for this city (with fallback suppression)
  let feeds = feedMap[city]?.feeds || [];
  if (city === "default") {
    const suppressed = feeds.filter(url => {
      const tag = Object.values(feedMap)
        .find(f => f.feeds?.includes(url))
        ?.neutralityTag;
      return tag === "commercial";
    });
    console.log(`⚠️ Suppressed ${suppressed.length} commercial feeds on fallback`);
    feeds = feeds.filter(url => !suppressed.includes(url));
  }

  // 2. Fetch and collect all items
  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      console.log(`✅ Fetched ${url} — ${feed.items?.length || 0} items`);
      allItems.push(...(feed.items || []));
    } catch (err) {
      console.error(`❌ Failed to fetch ${url}:`, err.message);
    }
  }

  // 3. Sort by date, take top 10, map to our shape
  const topItems = allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10)
    .map(item => ({
      title:   item.title,
      url:     item.link,
      snippet: item.contentSnippet || ""
    }));

  // 4. Filter out clickbait, ALL-CAPS, exclamations, very short titles
  const baitWords = [
    "shocking", "devastating", "furious",
    "heartbreaking", "explosive", "slams",
    "rips", "chaos", "meltdown"
  ];

  return topItems.filter(item => {
    const text         = `${item.title} ${item.snippet}`.toLowerCase();
    const isBait       = baitWords.some(w => text.includes(w));
    const isAllCaps    = item.title === item.title.toUpperCase();
    const hasExclaim   = item.title.includes("!");
    const isTooShort   = item.title.trim().split(/\s+/).length < 5;
    return !isBait && !isAllCaps && !hasExclaim && !isTooShort;
  });
}

/**
 * Single Netlify Function entry point.
 */
exports.handler = async (event) => {
  console.log(`Received lat: ${event.queryStringParameters?.lat}, lon: ${event.queryStringParameters?.lon}`);

  const { lat, lon } = event.queryStringParameters || {};
  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing lat/lon" })
    };
  }

  const latitude  = parseFloat(lat);
  const longitude = parseFloat(lon);

  try {
    // Load your data files
    const zipMapPath  = path.join(__dirname, "cityziplatlong.json");
    const feedMapPath = path.join(__dirname, "newsFeeds.json");

    const zipMap  = JSON.parse(fs.readFileSync(zipMapPath,  "utf8"));
    const feedMap = JSON.parse(fs.readFileSync(feedMapPath, "utf8"));

    // Resolve city
    const closestZip = findClosestZip(latitude, longitude, zipMap);
    const city       = zipMap[closestZip]?.city || "default";
    if (city === "default") {
      console.log("⚠️ Fallback triggered — using default feed");
    }

    // Fetch, clean, and return headlines
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
    console.error("Local news function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:   "Failed to load headlines",
        details: err.message
      })
    };
  }
};
