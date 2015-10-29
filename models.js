var fs = require('fs');
var path = require('path');
var request = require('request');
var common = require('./common');

// 根据车系获取车款
// 车款获取地址: http://meta.che300.com/meta/model/model_series213.json?v=55
function build_model_url(series_id) {
  return 'http://meta.che300.com/meta/model/model_series' + series_id + '.json?v=57'
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
  console.log('-- 开始抓取车型 --');

  var files = fs.readdirSync(common.series_path);
  var count = 0;
  var complete = 0;

  files.forEach(function(file) {
    var series = JSON.parse(fs.readFileSync(path.join(common.series_path, file)).toString());

    count += series.length;

    series.forEach(function(_series) {
      var url = build_model_url(_series.series_id);

      req(url, function(body) {
        complete++;

        if (body == null) {
          return;
        }

        fs.writeFileSync(path.join(common.model_path, _series.series_id) + '.json', body);
      });
    });
  });

  var timer = setInterval(function() {
    if (count === complete) {
      clearInterval(timer);

      console.log('车型抓取完成');
      console.log('车系量: ' + count);
      console.log('完成量: ' + complete);

      return;
    }
  }, 500);
}

this.crawl();
