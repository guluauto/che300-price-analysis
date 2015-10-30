var fs = require('fs');
var cheerio = require('cheerio');
var req = require('../lib/req');
var data = require('../data');

exports.crawl = function() {
  console.log('-- 开始抓取品牌数据 --');

  req(data.home_url, function(body) {
    if (body == null) {
      console.log('抓取品牌数据失败');

      return;
    }

    var $ = cheerio.load(body);

    var $brand_els = $('.list_1');
    var brands = [];

    $brand_els.each(function() {
      brands.push({
        name: $(this).text().substring(2),
        id: $(this).attr('id'),
        index: $(this).attr('rel')
      });
    });

    fs.writeFileSync(data.brands_file, JSON.stringify(brands));

    console.log('-- 抓取品牌完成 --');
    console.log('** 品牌数量: ' + brands.length + ' **');
  });
}

this.crawl();
