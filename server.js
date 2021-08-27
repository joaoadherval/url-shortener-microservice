require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const URL = require("url").URL;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.post("/api/shorturl", bodyParser.urlencoded({ extended: false }) , function(req, res) {
  let response = {};
  inputUrl = req.body['url'];

  let url = new URL(inputUrl);

  dns.lookup(url.hostname, function(error, address, family){
    if(error) {
      res.json({error: 'invalid url'});
      return;
    } else {
      response['original_url'] = inputUrl;
    }
  });

  let inputShort = 1;

  Url.findOne({})
    .sort({ short_url: 'desc'})
    .exec(function(error, result) {
      if(!error && result != undefined){
        inputShort = result.short + 1;
      }
      if(!error){
        Url.findOneAndUpdate(
          {original_url: inputUrl},
          {original_url: inputUrl, short_url: inputShort},
          {new: truw, upsert: true},
          function(error, savedUrl) {
            if(!error){
              response['short_url'] = savedUrl.short;
              response.json(response);
            }
          }
        )
      }
    });

  res.json(response);
});

app.get("/api/shorturl/:urlid", function (req, res) {
  let response = {};
  let inputShort = req.params.urlid;

  Url.findOne({short: inputShort}, function(error, result){
    if(!error && result != undefined){
      response.redirect(result.original_url);
    } else {
      response.json({ error: 'url not found' });
    }
  });
});
