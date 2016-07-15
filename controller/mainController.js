var request = require('request');
var async = require('async');
var api = require('../config/api');
var fs = require('fs');

// Load all the things necessary for the api
var google = require('googleapis');
var gwt = google.webmasters('v3');

var queries = [{
  url: "http://google.com",
  googleQueries: [
    "",
    "inurl:cekey",
    "inurl:showstatic"
  ]
}, {
  url: "http://google.de",
  googleQueries: [
    ""
  ]
}];

startCalls();

function startCalls() {
  var results = [];

  async.eachSeries(queries, function(query, cb) {
    async.eachSeries(query.googleQueries, function(searchParam, cb) {
      getGoogleIndex(query.url, searchParam, function(res) {
        results.push(res);
        cb();
      });
    }, function(err) {
      if (err) {
        console.log('FAIL');
      } else {
        cb();
      }
    });
  }, function(err) {
    if (err) {
      console.log('FAIL');
    } else {
      console.log('END RES', results);
      fs.writeFile('./data.json', JSON.stringify(results, null, 2), 'utf-8');
    }
  });
}

function getGoogleIndex(url, searchParam, cb) {
  var rndUserAgent = api.userAgents[Math.floor(Math.random() * api.userAgents.length)];
  //var rndDelay = Math.random() * (20000 - 10000) + 10000;
  var rndDelay = Math.random() * (170 - 90) + 90;

  var options = {
    headers: {
      'User-Agent': rndUserAgent
    }
  };

  if (searchParam !== "") {
    searchParam = '+' + searchParam;
  }

  console.log('https://www.google.de/search?q=site:' + url + searchParam);
  console.log('Waiting on cooldown..');
  setTimeout(function() {
    console.log('Catching..');

    request('https://www.google.de/search?q=site:' + url + '+' + searchParam, options, function(error, response, html) {
      if (!error && response.statusCode == 200) {
        var cheerio = require('cheerio'),
          $ = cheerio.load(html, {
            decodeEntities: false
          });

        var data = $('#resultStats').html();

        if (data !== null) {
          var resultsNum = data.replace(/\(.*?\)/, '');
          resultsNum = resultsNum.replace(/\D/g, '');
          cb(resultsNum);
        } else {
          cb(0);
        }
      } else {
        cb(null);
      }
    });

  }, rndDelay);
}

function sendMail(data) {
  var SparkPost = require('sparkpost');
  var SparkPostClient = new SparkPost(api.sparkpost.key);

  var reqObj = {
    transmissionBody: {
      content: {
        from: 'me@sparkpostbox.com',
        subject: 'subject',
        text: JSON.stringify(data)
      },
      recipients: [{
        address: 'aliasgram@gmail.com'
      }]
    }
  };

  SparkPostClient.transmissions.send(reqObj, function(err, res) {
    if (!err) {
      console.log('successfully sent');
    } else {
      console.log(err);
    }
  });
}
