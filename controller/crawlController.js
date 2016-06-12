const Crawl = require('../models/crawl');

module.exports = class CrawlController {
  addCrawl(crawlObj) {
    let crawl = new Crawl(crawlObj);
    crawl.save();
  }
}
