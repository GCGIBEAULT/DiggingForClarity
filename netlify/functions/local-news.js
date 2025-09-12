// netlify/functions/local-news.js

const fs     = require("fs");
const path   = require("path");
const Parser = require("rss-parser");
const parser = new Parser();

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

  // If we’ve fallen back to “default,” suppress purely commercial feeds
  if (city === "default") {
    const suppressed = feeds.filter(url => {
      const tag = Object.values(feedMap)
        .find(conf => conf.feeds?.includes(url))
        ?.neutralityTag;
      return tag === "commercial";
    });
    feeds = feeds.filter(url => !suppressed.includes(url));
  }

  // Aggregate items from all feeds
  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      allItems.push(...(feed.items || []));
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }

  // Keep the 10 newest items
  const topItems = allItems
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10)
    .map(item => ({
      title:   item.title,
      url:     item.link,
      snippet: item.contentSnippet || ""
    }));

  // Filter out clickbait, ALL-CAPS, exclamation titles, very short headlines
  const baitWords = [
    "shocking", "devastating", "furious",
    "heartbreaking", "explosive", "slams",
    "rips", "chaos", "meltdown"
  ];

  return topItems.filter(item => {
    const text       = `${item.title} ${item.snippet}`.toLowerCase();
    const isBait     = baitWords.some(w => text.includes(w));
    const isAllCaps  = item.title === item.title.toUpperCase();
    const hasExclaim = item.title.includes("!");
    const isTooShort = item.title.trim().split(/\s+/).length < 5;
    return !isBait && !isAllCaps && !hasExclaim && !isTooShort;
  });
}

/**
 * Netlify Function entry point.
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
    // Load your lookup files
    const zipMapPath  = path.join(__dirname, "cityzipl
