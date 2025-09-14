exports.handler = async function (event) {
  // Parse incoming request body
  const { city, zip, lat, lon } = JSON.parse(event.body || "{}");

  // ✅ Log the incoming payload
  console.log(`[${new Date().toISOString()}] Incoming payload:`, { city, zip, lat, lon });

  // Sample snippets (static for now)
  const snippets = [
    { title: "Local park reopens after renovations" },
    { title: "City council approves new housing plan" },
    { title: "Farmers market expands weekend hours" },
    { title: "New bike lanes added downtown" },
    { title: "Library launches fall reading program" },
    { title: "Local artist featured in gallery show" },
    { title: "Community cleanup scheduled Saturday" }
  ];

  // ✅ Log the number of snippets being returned
  console.log(`[${new Date().toISOString()}] Returning ${snippets.length} snippets`);

  // Return the response
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ snippets })
  };
};

