var fs = require('fs');
var path = require('path');
var data = require('./data');
var Pooler = require('./lib/pooler');
var model = require('./model/model');

require('./db');

// 根据车系获取车款
// 车款获取地址: http://meta.che300.com/meta/model/model_series213.json?v=55
function build_model_url(series_id) {
  return 'http://meta.che300.com/meta/model/model_series' + series_id + '.json?v=57'
}

exports.crawl = function() {
  console.log('-- 开始根据车系抓取车型 --');

  var files = fs.readdirSync(data.series_path);
  var count = 0;
  var complete = 0;
  var total = 0;

  var insert_promises = [];

  files.forEach(function(file) {
    var series = JSON.parse(fs.readFileSync(path.join(data.series_path, file)).toString());

    count += series.length;

    series.forEach(function(_series) {
      var url = build_model_url(_series.series_id);

      Pooler.add({
        url: url,
        callback: function(body) {
          complete++;
          fs.writeFileSync(path.join(data.model_path, _series.series_id) + '.json', body);

          var models = JSON.parse(body);
          total += models.length;

          insert_promises.push(model.create(models));
        }
      });
    });
  });

  Pooler.done = function() {
    console.log('车型抓取完成');
    console.log('车系量: ' + count);
    console.log('完成量: ' + complete);
    console.log('车型量: ' + total);

    Promise
      .all(insert_promises)
      .then(function() {
        console.log('插入数据库完成');
      });
  }

  Pooler.run();
}

this.crawl();
