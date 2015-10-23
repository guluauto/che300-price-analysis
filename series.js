var fs = require('fs');
var path = require('path');
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

brand_ids.forEach(function(brand_id) {
  var url = build_series_url(brand_id);

  common.req(url, function(body) {
    fs.writeFileSync(path.join(common.series_path, brand_id) + '.json', body);
  });
});
