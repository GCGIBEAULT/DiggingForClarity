// netlify/functions/local-news.js

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ working: true })
  };
};
