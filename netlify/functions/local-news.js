const fs   = require("fs");
const path = require("path");

exports.handler = async () => {
  // Load just the first few entries of your ZIP→city map
  const zipMap = JSON.parse(
    fs.readFileSync(path.join(__dirname, "cityziplatlong.json"), "utf8")
  );

  // Return the first 5 zips so you don’t overflow the browser
  const sample = Object.keys(zipMap).slice(0, 5).reduce((acc, zip) => {
    acc[zip] = zipMap[zip].city;
    return acc;
  }, {});

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ working: true, sample })
  };
};
