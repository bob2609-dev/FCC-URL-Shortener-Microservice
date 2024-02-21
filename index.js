require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const url = require('url')
const { isUrl } = require('check-valid-url');

const shortUniqueId = require('short-unique-id');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});
const customUid = new shortUniqueId({
  length: 15, // Generate IDs of length 10
  dictionary: 'alphanum', // Use only alphanumeric characters
  encode: 'base64' // Encode using base64 for shorter, URL-safe IDs
});
app.post("/api/shorturl", (req, res) => {

  console.log(req.body.url)
  const ogURL = req.body.url;
  const shortURL = customUid.rnd()
  let input = '', domain = '', param = '', short = 0;

  isValidUrl(ogURL)
    ? res.json({ original_url: ogURL, short_url: shortURL })
    : res.json({ error: "invalid url" })

  // res.json({original_url:ogURL,short_url:shortURL})



})

function isValidUrl(input) {

  if (isUrl(input)) {
    return true
  }
  else {
    return false
  }
}



app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
