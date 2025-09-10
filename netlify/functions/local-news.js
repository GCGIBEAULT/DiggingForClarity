exports.handler = async (event) => {
  const { latitude, longitude } = JSON.parse(event.body);

  // Reverse-geocode as before…
  const geo = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_KEY}`)
    .then(r => r.json());
  const comp = geo.results[0].components;
  const city  = comp.city || comp.town || comp.village || "Denver";
  const state = comp.state_code || "CO";

  // 1. Build your prompt
  const prompt = `
Generate 7 fictional but realistic local news headlines for ${city}, ${state}.
Focus on community, transit, education, public safety, and events.
Return a JSON array of strings.
  `.trim();

  // 2. Call Copilot API
  const copilot = await fetch(process.env.COPILOT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.COPILOT_KEY}`
    },
    body: JSON.stringify({ prompt })
  }).then(r => r.json());

  // 3. Return the generated list
  return {
   exports.handler = async (event) => {
  // … your geocoding & Copilot logic …

  // before:  
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(copilot)
  // }

  // after—notice the headers block added:
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(copilot)
  };
};

