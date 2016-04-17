var request = require('request');
var api = require('../config/api');

/*getGTmetrix('http://google.de', function(res) {
  console.log(res);
});*/

/*getSistrix('http://google.de',{
  method: 'links.overview', //domain.sichtbarkeitsindex
  mobile: false
}, function(res) {
  console.log(res);
});*/

/*getGooglePSI('http://google.de', {mobile: false}, function(res) {
  console.log(res);
});*/

function getGooglePSI(url, options, cb) {
  var qs = {
    url: url,
    key: api.googlePsi.key
  };

  if (options.mobile) {
    qs.strategy = 'mobile';
  }

  request({
    url: 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed/',
    method: 'GET',
    qs: qs
  })
  .on('response', function(response) {
    // Add error handling here
    // console.log(response.statusCode);
  })
  .on('data', function(dataRaw) {
    //console.log(dataRaw);
    /*var data;

    try {
      data = JSON.parse(dataRaw);
    } catch (e) {
      return console.error(e);
    }

    console.log(data);*/

    var data = ab2str(dataRaw);
    data = JSON.parse(JSON.stringify(data));
    //console.log(data);
    console.log(data.ruleGroups.SPEED.score);
    //console.log(JSON.parse(dataRaw));
    //console.log(data.ruleGroups.SPEED.score);

  });
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
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
