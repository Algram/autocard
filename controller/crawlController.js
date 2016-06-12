const Crawl = require('../models/crawl');

export default class CrawlController {
  addCrawl(crawlObj) {
    let crawl = new Crawl(crawlObj);
    crawl.save();
  }
}
