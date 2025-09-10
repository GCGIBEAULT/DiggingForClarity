exports.handler = async () => {
  const headlines = [
    "Denver expands bike lane network citywide",
    "New community center opens in Five Points",
    "City Council debates noise ordinance changes",
    "Local artists host fall gallery walk",
    "Public transit adds late-night service routes",
    "Denver library launches mobile book van",
    "Neighborhood cleanup scheduled for Saturday"
  ];
  return {
    statusCode: 200,
    body: JSON.stringify(headlines)
  };
};
