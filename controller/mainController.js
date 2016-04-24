var request = require('request');
var api = require('../config/api');
var math = require('math');

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

getGoogleIndex('http://google.de', {mobile: false}, function(res) {
  console.log(res);
});



var userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
  'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.9) Gecko/20100508 SeaMonkey/2.0.4',
  'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; da-dk) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.14 (KHTML, like Gecko) Chrome/9.0.600.0 Safari/534.14',
    'Mozilla/5.0 (Windows NT 6.0; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.66 Safari/535.11',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.45 Safari/535.19',
    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/532.0 (KHTML, like Gecko) Chrome/4.0.201.1 Safari/532.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.04 Chromium/15.0.871.0 Chrome/15.0.871.0 Safari/535.2',
    'Mozilla/5.0 (X11; Linux i686) AppleWebKit/535.1 (KHTML, like Gecko) Ubuntu/10.04 Chromium/14.0.813.0 Chrome/14.0.813.0 Safari/535.1',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:33.0) Gecko/20100101 Firefox/33.0',
    'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0',
    'Mozilla/5.0 (X11; Linux i686; rv:30.0) Gecko/20100101 Firefox/30.0',
    'Mozilla/5.0 (IE 11.0; Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
    'Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36 Edge/12.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.9600',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Oupeng/10.2.1.86910 Safari/534.30',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/600.3.10 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.10',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.17 (KHTML, like Gecko) Version/6.0.2 Safari/536.26.17',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.89 Vivaldi/1.0.83.38 Safari/537.36',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
];


function getGoogleIndex(url) {


  var options = {
    headers: {
      'User-Agent': 'request'
    }
  };

  request('https://www.google.de/search?q=site:google.de', options, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var cheerio = require('cheerio'),
      $ = cheerio.load(html);

    var data = $('#resultStats').html();

    console.log(data);
  }
});
}

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
