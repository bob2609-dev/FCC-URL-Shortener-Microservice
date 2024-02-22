require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const url = require('url')
const { isUrl } = require('check-valid-url');
const { dns } = require('dns')
var mongoose = require('mongoose')



var mongodb_uri = process.env.MONGO_URI
console.log(mongodb_uri)
mongoose.connect(mongodb_uri, { useNewUrlParser: true, useUnifiedTopology: true })

// create mongodb schema
const Schema = mongoose.Schema;

const urlSchema = Schema(
  {
    original_url: { type: String, required: true },
    short_url: { type: String }
  }
)


const URL = mongoose.model('urls', urlSchema)

const createAndSaveUrl = (urlObject) => {

  console.log("I have been called **********!")
  console.log(urlObject)
  console.log('I will now try to save the URL to mongodb')
  var newURLPair = new URL(urlObject)

  newURLPair.save((err, data) => {
    if (err) {
      return console.error(err)
    }
    else {
      console.log("URL Pair Saved")
    }

  })

}




const shortUniqueId = require('short-unique-id');
const { doesNotMatch } = require('assert');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let url_pair = { original_url: '', short_url: '' };
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
  url_pair = { original_url: ogURL, short_url: shortURL };

  createAndSaveUrl({ original_url: ogURL, short_url: shortURL })

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

app.get('/api/shorturl/:short_url', async (req, res) => {

  try {
    var inputURL = req.params.short_url
    const foundURL =await findUrlByShortURL(inputURL);
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    console.log(foundURL)
    console.log(foundURL[0].original_url)

    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    res.redirect(foundURL[0].original_url)
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

  // console.log(url_pair);


  // res.send(foundURL)
})

const findUrlByShortURL = async (shortURL) => {
  try {

    const urlFound = await URL.find({ short_url: shortURL }, (err, foundURL) => {

      if (err) {
        console.log(err)
      } else {
        console.log(foundURL)
      }
    }).exec();

    return urlFound;

  } catch (error) {
    console.error(error)
    throw error;
  }
}



app.listen(port, function () {
  // const urlPair = localStorage.getItem('url_pair')
  console.log(`Listening on port ${port}`);
});
