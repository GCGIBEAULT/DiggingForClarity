exports.handler = async function (event) {
  const snippets = [
    { title: "Local park reopens after renovations" },
    { title: "City council approves new housing plan" },
    { title: "Farmers market expands weekend hours" },
    { title: "New bike lanes added downtown" },
    { title: "Library launches fall reading program" },
    { title: "Local artist featured in gallery show" },
    { title: "Community cleanup scheduled Saturday" }
  ];
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ snippets })
  };
};
