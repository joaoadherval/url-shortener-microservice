require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require('dns');
const validUrl = require('valid-url');
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
    console.log("INFO: Validating url - " + inputUrl.toString());
    if(error) {
      console.log("ERROR: Invalid URL - " + inputUrl.toString());
      res.json({error: 'invalid url'});
      return
    } else {
      if(!validUrl.isWebUri(inputUrl)){
        console.log("ERROR: Invalid URL - " + inputUrl.toString());
        res.json({error: 'invalid url'});
        return
      }

      console.log("INFO: URL validated - " + inputUrl.toString());
      response['original_url'] = inputUrl;

      let inputShort = 1;

      UrlModel.find({}).sort({short_url: 'desc'}).limit(1).exec(function(err, result){
        if(result[0] == undefined){
          console.log("INFO: Shortening URL - " + inputUrl.toString());
          response['short_url'] = inputShort;
        } else {
          console.log("INFO: Shortening URL - " + inputUrl.toString());
          inputShort = result[0].short_url + 1;
          response['short_url'] = inputShort;
        }

        console.log("INFO: Saving URL - " + inputUrl.toString());
        var newUrl = new UrlModel({
          original_url: inputUrl,
          short_url: inputShort
        });

        newUrl.save(function(err, data) {
          if (err) {
            return console.error(err);
          }
        });

        console.log("INFO: Saved URL - " + inputUrl.toString());
        res.json(response);
      });
    }
  });
});

app.get("/api/shorturl/:urlid", function (req, res) {
  let inputShort = req.params.urlid;

  UrlModel.findOne({short_url: inputShort}, function(error, result){
    if(!error && result != undefined){
      res.redirect(result.original_url);
    } else {
      res.json({ error: 'url not found' });
    }
  });
});
