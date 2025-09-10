// test-local-news.js
const { handler } = require('./netlify/functions/local-news.js');

// Fake Netlify event & context
const event = {};
const context = {};

handler(event, context).then(res => {
  console.log('StatusCode:', res.statusCode);
  console.log('Body:', JSON.parse(res.body));
}).catch(err => {
  console.error('Error:', err);
});
