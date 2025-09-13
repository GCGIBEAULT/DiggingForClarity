// Recommit to trigger Netlify deploy
const { lat, lon, zip } = event.queryStringParameters;
console.log("Received query params:", { lat, lon, zip });

let latitude = lat;
let longitude = lon;

if (zip && (!lat || !lon)) {
  const zipData = require("./cityziplatlong.json");
  if (zipData[zip]) {
    latitude = zipData[zip].lat;
    longitude = zipData[zip].lon;
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

const Parser = require("rss-parser");
const parser = new Parser();
const zipMap = require("./cityziplatlong.json");
const feedMap = require("./newsFeeds.json");

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

async function getHeadlines(city, feedMap) {
  let feeds = feedMap[city]?.feeds || [];

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
    "shocking", "devastating", "furious",
    "heartbreaking", "explosive", "slams",
    "rips", "chaos", "meltdown"
  ];

  return allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10)
    .map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.contentSnippet || ""
    }))
    .filter(item => {
      const txt = `${item.title} ${item.snippet}`.toLowerCase();
      const isBait = baitWords.some(w => txt.includes(w));
      const isAllCaps = item.title === item.title.toUpperCase();
      const hasExcl = item.title.includes("!");
      const isShort = item.title.trim().split(/\s+/).length < 5;
      return !isBait && !isAllCaps && !hasExcl && !isShort;
    });
}

exports.handler = async function(event) {
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

  try {
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
      body: JSON.stringify({ error: "Failed to load headlines", details: err.message })
    };
  }
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
