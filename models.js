var fs = require('fs');
var path = require('path');
var common = require('./common');

// 根据车系获取车款
// 车款获取地址: http://meta.che300.com/meta/model/model_series213.json?v=55
function build_model_url(series_id) {
  return 'http://meta.che300.com/meta/model/model_series' + series_id + '.json?v=55'
}

var files = fs.readdirSync(common.series_path);

files.forEach(function(file) {
  var series = JSON.parse(fs.readFileSync(path.join(common.series_path, file)).toString());

  series.forEach(function(_series) {
    var url = build_model_url(_series.series_id);

    common.req(url, function(body) {
      fs.writeFileSync(path.join(common.model_path, _series.series_id) + '.json', body);
    });
  });
})
