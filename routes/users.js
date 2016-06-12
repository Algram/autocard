var express = require('express');
var router = express.Router();

// Load CrawlController
var CC = require('../controller/crawlController');
var CrawlController = new CC();

/* GET users listing. */
router.get('/', function(req, res, next) {
  CrawlController.addCrawl({
      url: 'http://google.com',
      pagespeed: {
        mobile: 90,
        desktop: 99
      },
      queries: [
        "",
        "inurl:cekey",
        "inurl:showstatic"
      ]
    });
  res.send('respond with a resource');
});

module.exports = router;
