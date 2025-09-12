exports.handler = async (event, context) => {
  // … your data fetching logic …

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",          // allow GitHub Pages
      "Access-Control-Allow-Methods": "GET, POST", // optional
      "Content-Type": "application/json"
    },
    body: JSON.stringify(headlines)
  };
};
