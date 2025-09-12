const zipMap = require("./cityziplatlong.json");

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(zipMap)
  };
};
