var request = require('request');
var async = require('async');

// Load all the things necessary for the api
var google = require('googleapis');
var gwt = google.webmasters('v3');
var api = require('../config/api');

/*getGWT();
function getGWT(url, cb) {
  var key = require('../config/key.json');
  var authClient = new google.auth.JWT(key.client_email, key.client_id, key.private_key, ['https://www.googleapis.com/auth/webmasters.readonly'], null);


  authClient.authorize(function (err, tokens) {
    if (err) {
      return console.log(err, tokens);
    }

  });
}*/

var urls = ['http://google.com'];
startCalls();
function startCalls() {


  async.parallel({
      one: function(callback){
          setTimeout(function(){
              callback(null, 1);
          }, 200);
      },
      two: function(callback){
          setTimeout(function(){
              callback(null, 2);
          }, 100);
      }
  },
  function(err, results) {
      // results is now equals to: {one: 1, two: 2}
  });


  var result = {};
  async.each(urls, function(url, callback) {

    // Perform operation on file here.
    console.log('Processing url ' + url);

    result.sistrix = [];

    getGTmetrix(url, function(res) {
      console.log('GTmetrix',res);
      result.gtmetrix = res;
    });

    getSistrix(url,{
      method: 'links.overview',
      mobile: false
    }, function(res) {
      console.log('Sistrix', res);
      result.sistrix.push({'links.overview': res});
    });

    getSistrix(url,{
      method: 'domain.sichtbarkeitsindex',
      mobile: false
    }, function(res) {
      console.log('Sistrix', res);
      result.sistrix.push({'domain.sichtbarkeitsindex.desktop': res});
    });

    getSistrix(url,{
      method: 'domain.sichtbarkeitsindex',
      mobile: true
    }, function(res) {
      console.log('Sistrix', res);
      result.sistrix.push({'domain.sichtbarkeitsindex.desktop': res});
    });

    getGooglePSI(url, {mobile: false}, function(res) {
      console.log('Google PSI', res);
      result.googlepsi = res;
    });

    getGoogleIndex(url, function(res) {
      console.log('Google Index', res);
      result.googleindex = res;
    });


    if( file.length > 32 ) {
      console.log('This file name is too long');
      callback('File name too long');
    } else {
      // Do work to process file here
      console.log('File processed');
      callback();
    }
  }, function(err){
      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A file failed to process');
      } else {
        console.log('All files have been processed successfully');
        console.log(result);
      }
  });
}

function sendMail() {
  var SparkPost = require('sparkpost');
  var SparkPostClient = new SparkPost(api.sparkpost.key);

  var reqObj = {
    transmissionBody: {
      content: {
        from: 'me@sparkpostbox.com',
        subject: 'subject',
        text: 'text body'
      },
      recipients: [
        {address: 'aliasgram@gmail.com'}
      ]
    }
  };

  SparkPostClient.transmissions.send(reqObj, function(err, res) {
    if (!error) {
      console.log('successfully sent');
    } else {
      console.log(err);
    }
  });
}

function getGoogleIndex(url, cb) {
  var rndNum = Math.floor(Math.random() * api.userAgents.length);

  var options = {
    headers: {
      'User-Agent': api.userAgents[rndNum]
    }
  };

  request('https://www.google.de/search?q=site:google.de', options, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var cheerio = require('cheerio'),
        $ = cheerio.load(html, {decodeEntities: false});

      var data = $('#resultStats').html();

      var resultsNum = data.replace(/\(.*?\)/, '');
      resultsNum = resultsNum.replace(/\D/g,'');

      cb(resultsNum);
    }
  });
}

function getGooglePSI(url, optionsExt, cb) {
  var qs = {
    url: url,
    key: api.googlePsi.key
  };

  if (optionsExt.mobile) {
    qs.strategy = 'mobile';
  }

  var options = {
    qs: qs
  };

  request('https://www.googleapis.com/pagespeedonline/v2/runPagespeed/', options, function (error, response, dataRaw) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(dataRaw);
      cb(data.ruleGroups.SPEED.score);
    }
  });
}

function getSistrix(url, options, cb) {
  var qs = {
    domain: url,
    format: 'json',
    api_key: api.sistrix.key
  };

  if (options.mobile) {
    qs.mobile = options.mobile;
  }

  request({
    url: 'http://api.sistrix.net/' + options.method,
    method: 'GET',
    qs: qs
  })
  .on('response', function(response) {
    // Add error handling here
    // console.log(response.statusCode);
  })
  .on('data', function(dataRaw) {
    var data = JSON.parse(dataRaw);

    switch (options.method) {
      case 'domain.sichtbarkeitsindex':
        cb(data.answer[0].sichtbarkeitsindex[0].value);
        break;
      case 'links.overview':
        cb(data.answer[0].domains[0].num);
        break;
    }

  });
}

function getGTmetrix(url, cb) {
  request({
    url: 'https://gtmetrix.com/api/0.1/test',
    method: 'POST',
    form: {
      url: url
    },
    auth: {
      user: api.gtmetrix.user,
      pass: api.gtmetrix.pass
    }
  })
  .on('response', function(response) {
    // Add error handling here
  })
  .on('data', function(data) {
    var poll_state_url = JSON.parse(data.toString()).poll_state_url;
    loop();

    var finished = false;
    function loop() {

      request({
        url: poll_state_url,
        method: 'GET',
        auth: {
          user: api.gtmetrix.user,
          pass: api.gtmetrix.pass
        }
      })
      .on('data', function(dataRaw) {
        var data = JSON.parse(dataRaw);

        if (data.state === 'completed') {
          finished =  true;

          cb({
            pagespeed_score: data.results.pagespeed_score,
            yslow_score: data.results.yslow_score
          });
        }

        if (!finished) {
          setTimeout(loop, 2000);
        }
      });
    }
  });
}
