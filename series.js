var fs = require('fs');
var path = require('path');
var data = require('./data');
var req = require('./lib/req');

// 根据品牌获取车系
// 车300车系获取地址: http://meta.che300.com/meta/series/series_brand{brand_id}.json?v=55
var brands = require('./brands.json');

var brand_ids = brands.map(function(brand) {
  return brand.id;
});

function build_series_url(brand_id) {
  return 'http://meta.che300.com/meta/series/series_brand' + brand_id + '.json?v=55';
}

exports.crawl = function() {
  console.log('-- 开始根据品牌抓取车系 --');

  var count = brand_ids.length;
  var complete = 0;
  var total = 0;

  brand_ids.forEach(function(brand_id) {
    var url = build_series_url(brand_id);

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
