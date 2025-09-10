const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { latitude, longitude } = JSON.parse(event.body);

  // Reverse geocode using OpenCage
  const geoResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`);
  const geoData = await geoResponse.json();
  const components = geoData.results[0].components;

  const city = components.city || components.town || components.village || "Denver";
  const state = components.state_code || "CO";

  // Simulated Copilot-generated headlines
  const headlines = [
    `${city} launches new community garden initiative`,
    `Public library in ${city} expands weekend hours`,
    `${city} high school robotics team wins state championship`,
    `New bike lanes approved for downtown ${city}`,
    `${city} fire department hosts safety workshop`,
    `Farmers market returns to ${city} this Saturday`,
    `${city} announces small business grant program`
  ];

  return {
    statusCode: 200,
    body: JSON.stringify(headlines)
  };
};
