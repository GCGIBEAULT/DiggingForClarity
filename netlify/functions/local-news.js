// netlify/functions/local-news.js

exports.handler = async (event) => {
  const { lat, lon } = event.queryStringParameters || {};

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      working: true,
      received: { lat, lon }
    })
  };
};
