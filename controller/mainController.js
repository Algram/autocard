var request = require('request');
var api = require('../config/api');


request({
    url: 'https://gtmetrix.com/api/0.1/test',
    method: 'POST',
    form: {
      url: 'https://www.google.com'
    },
    auth: {
      user: api.user,
      pass: api.pass
    }
  })
  .on('response', function(response, body) {
    console.log(response.statusCode);
    console.log(body);
  })
  .on('data', function(data) {
    var poll_state_url = JSON.parse(data.toString()).poll_state_url;

    setTimeout(function() {
      request({
          url: poll_state_url,
          method: 'GET',
          auth: {
            user: api.user,
            pass: api.pass
          }
        })
        .on('data', function(data) {
          var poll_state_url = JSON.parse(data.toString());
          console.log(poll_state_url);
        });
    }, 5000);

  });
