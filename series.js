var fs = require('fs');
var path = require('path');
var request = require('request');
var common = require('./common');

// 根据品牌获取车系
// 车300车系获取地址: http://meta.che300.com/meta/series/series_brand{brand_id}.json?v=55
var brands = require('./brands.json');

var brand_ids = brands.map(function(brand) {
  return brand.id;
});

function build_series_url(brand_id) {
  return 'http://meta.che300.com/meta/series/series_brand' + brand_id + '.json?v=55';
}

function req(url, callback) {
  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36'
    }
  };

  request(options, function(err, res, body) {
    if (err) {
      console.log('请求失败');
      console.log(err);

      callback.call(this, null, err);

      return;
    }

    if (res.statusCode !== 200) {
      console.log('请求失败');
      console.log('响应状态码:', res.statusCode);

      callback.call(this, null, res);
      return;
    }

    callback.call(this, body);
  });
}

exports.crawl = function() {
  brand_ids.forEach(function(brand_id) {
    var url = build_series_url(brand_id);

    req(url, function(body) {
      fs.writeFileSync(path.join(common.series_path, brand_id) + '.json', body);
    });
  });
}
