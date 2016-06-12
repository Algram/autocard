var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create the crawl schema
var crawlSchema = new Schema({
  url: String,
  pagespeed: Object,
  queries: Array
});

// Create the model with the crawl schema
var Crawl = mongoose.model('Crawl', crawlSchema);

module.exports = Crawl;
