const Parser = require("rss-parser");
const zipMap = require("./cityziplatlong.json");
const feedMap = require("./newsFeeds.json");

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

async function getHeadlinesFromFeed(city, feedMap) {
  console.log("Calling fallback feed logic for city:", city);
  const parser = new Parser();
  const feeds = feedMap[city]?.feeds || [];
  console.log("Feeds found for city:", feeds);

  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      allItems.push(...(feed.items || []));
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }

  console.log("Total items fetched:", allItems.length);

  const baitWords = ["shocking", "devastating", "furious", "heartbreaking", "explosive", "slams", "rips", "chaos", "meltdown"];
  return allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10)
    .map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.contentSnippet || ""
    }))
    .filter(item => {
      const txt = ` ${item.title} ${item.snippet} `.toLowerCase();
      const isBait = baitWords.some(w => txt.includes(w));
      const isAllCaps = item.title === item.title.toUpperCase();
      const hasExcl = item.title.includes("!");
      return !isBait && !isAllCaps && !hasExcl;
    });
}

async function getHeadlines(city, zip, lat, lon, feedMap) {
  try {
    console.log("Calling Copilot with:", { city, zip, lat, lon });
    const response = await fetch('https://copilot-curate.netlify.app/.netlify/functions/editor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, zip, lat, lon })
    });

    const curated = await response.json();
    console.log("Copilot response:", curated);

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
    console.log("Received query params:", { lat, lon, zip });

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

    const cleanHeadlines = await getHeadlines(city, zip, latitude, longitude, feedMap);

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
      body: JSON.stringify({ error: "Failed to load headlines" })
    };
  }
};
