var fs = require('fs');
var path = require('path');
var data = require('../data');
var req = require('../lib/req');


var brands = require(data.brands_file);

var brand_ids = brands.map(function(brand) {
  return brand.id;
});

exports.crawl = function() {
  console.log('-- 开始根据品牌抓取车系 --');

  var count = brand_ids.length;
  var complete = 0;
  var total = 0;

  brand_ids.forEach(function(brand_id) {
    var url = data.build_series_url(brand_id);

    req(url, function(body) {
      complete++;

      if (body == null) {
        return;
      }

      fs.writeFileSync(path.join(data.series_path, brand_id) + '.json', body);

      total += JSON.parse(body).length;
    });
  });

  var timer = setInterval(function() {
    if (count === complete) {
      clearInterval(timer);

      console.log('车系抓取完成');
      console.log('品牌量: ' + count);
      console.log('完成量: ' + complete);
      console.log('车系量: ' + total);

      return;
    }
  }, 500);
};

this.crawl();
