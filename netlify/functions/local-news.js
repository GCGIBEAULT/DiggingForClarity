exports.handler = async (event) => {
  // 1. Respond to CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST"
      },
      body: ""
    };
  }

  // 2. Handle the actual POST
  const { latitude, longitude } = JSON.parse(event.body);
  // … your reverse‐geocode & Copilot logic here …

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(headlines)
  };
};

    body: JSON.stringify(copilot)
  };
};

