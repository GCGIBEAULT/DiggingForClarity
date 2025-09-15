const zipMap = require("./cityziplatlong.json");

function findClosestZip(lat, lon, zipMap) {
  let closestZip = null;
  let minDistance = Infinity;
  for (const z in zipMap) {
    const { lat: zLat, lon: zLon } = zipMap[z];
    const distance = Math.sqrt(Math.pow(lat - zLat, 2) + Math.pow(lon - zLon, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestZip = z;
    }
  }
  return closestZip;
}

async function fetchCopilot(location, zip, lat, lon) {
  try {
    const response = await fetch("https://copilot-curate.netlify.app/.netlify/functions/editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: location, zip, lat, lon })
    });

    const result = await response.json();

    // No filters, just return the first 7 valid titles
    return Array.isArray(result.snippets)
      ? result.snippets.filter(s => s.title).slice(0, 7)
      : [];
  } catch (err) {
    console.error("Copilot fetch failed:", err.message);
    return [];
  }
}

exports.handler = async function (event) {
  try {
    const { lat, lon } = JSON.parse(event.body);
    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing coordinates" })
      };
    }

    // Force static news for now to guarantee display
    const snippets = [
      {
        title: "Mayor Daniel Lurie’s Downtown Initiative",
        url: "https://abc7news.com/san-francisco/"
      },
      {
        title: "Gang and Drug Arrests in Lake Tahoe Region",
        url: "https://www.cbsnews.com/sanfrancisco/local-news/"
      },
      {
        title: "Shooting Investigation Linked to Charlie Kirk",
        url: "https://www.nbcbayarea.com/news/local/"
      },
      {
        title: "Operation Cleanup Columbus in San Jose",
        url: "https://abc7news.com/san-jose/"
      },
      {
        title: "Empire Music Label’s Free Civic Center Concert",
        url: "https://abc7news.com/empire-concert/"
      },
      {
        title: "Deadly Stabbing on Junipero Serra Blvd",
        url: "https://www.nbcbayarea.com/news/local/san-francisco-deadly-stabbing/"
      },
      {
        title: "Valkyries Playoff Game Relocated",
        url: "https://www.cbsnews.com/sanfrancisco/sports/"
      }
    ];

    return {
      statusCode: 200,
      body: JSON.stringify(snippets)
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
