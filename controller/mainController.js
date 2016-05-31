var request = require('request');
var async = require('async');
var api = require('../config/api');
var fs = require('fs');

// Load all the things necessary for the api
var google = require('googleapis');
var gwt = google.webmasters('v3');

var queries = [
  {
    url: "http://google.com",
    googleQueries: [
      "",
      "inurl:cekey",
      "inurl:showstatic"
    ]
  },
  {
    url: "http://google.de",
    googleQueries: [
      ""
    ]
  }
];

startCalls();

function startCalls() {
  var results = [];

  async.eachSeries(queries, function(query, cb) {
    async.parallel([
        function(callback) {
          getGTmetrix(query.url, function(res) {
            callback(null, {
              'gtmetrix': res
            });
          });
        },
        function(callback) {
          async.parallel([
            function(callback) {
              getGooglePSI(query.url, {mobile: false}, function(res) {
                callback(null, {
                  'desktop': res
                });
              });
            },
            function(callback) {
              getGooglePSI(query.url, {mobile: true}, function(res) {
                callback(null, {
                  'mobile':res
                });
              });
            }
          ], function(err, results) {
            callback(null, {
              'googlepsi': results
            });
          });
        },
        function(callback) {
          async.parallel([
            function(callback) {
              getSistrix(query.url,{
                method: 'links.overview',
                mobile: false
              }, function(res) {
                callback(null, {
                  'links.overview': res
                });
              });
            },
            function(callback) {
              getSistrix(query.url,{
                method: 'domain.sichtbarkeitsindex',
                mobile: false
              }, function(res) {
                callback(null, {
                  'domain.sichtbarkeitsindex.desktop': res
                });
              });
            },
            function(callback) {
              getSistrix(query.url,{
                method: 'domain.sichtbarkeitsindex',
                mobile: true
              }, function(res) {
                callback(null, {
                  'domain.sichtbarkeitsindex.mobile': res
                });
              });
            }
          ], function(err, results) {
            callback(null, {
              'sistrix': results
            });
          });
        },
        function(callback) {
          var data = [];
          async.eachSeries(query.googleQueries, function(searchParam, cb) {
            getGoogleIndex(query.url, searchParam, function(res) {
              data.push(res);
              cb();
            });
          }, function(err) {
            if(err) {
              console.log('FAIL');
            } else {
              callback(null, data);
            }
          });
        }
    ], function(err, res){
      results.push(res);
       cb();
    });


  }, function(err){
    if(err) {
      console.log('FAIL');
    } else {
      console.log('END RES', results);
      fs.writeFile('./data.json', JSON.stringify(results, null, 2) , 'utf-8');
    }
  });
}

function getGoogleIndex(url, searchParam, cb) {
  var rndUserAgent = api.userAgents[Math.floor(Math.random() * api.userAgents.length)];
  var rndDelay = Math.random() * (20000 - 10000) + 10000;
  //var rndDelay = Math.random() * (170 - 90) + 90;

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

    request('https://www.google.de/search?q=site:' + url + '+' + searchParam, options, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var cheerio = require('cheerio'),
          $ = cheerio.load(html, {decodeEntities: false});

        var data = $('#resultStats').html();

        if (data !== null) {
          var resultsNum = data.replace(/\(.*?\)/, '');
          resultsNum = resultsNum.replace(/\D/g,'');
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
    // TODO Add error handling here
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
      recipients: [
        {address: 'aliasgram@gmail.com'}
      ]
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

/*getGWT();
function getGWT(url, cb) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/raphaelg/Dokumente/Development/autocard/config/key.json';

  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return console.log('Failed to get the default credentials: ' + String(err));
    }
    // The createScopedRequired method returns true when running on GAE or a local developer
    // machine. In that case, the desired scopes must be passed in manually. When the code is
    // running in GCE or a Managed VM, the scopes are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single, space-delimited string.
      console.log('abe');
      authClient = authClient.createScoped(['https://www.googleapis.com/auth/webmasters']);
    }

    gwt.urlcrawlerrorscounts.query({ auth: authClient, siteUrl: ''}, function(err, data) {
      console.log(err, data);
    });
  });
}
*/
