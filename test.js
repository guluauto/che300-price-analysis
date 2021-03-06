var request = require('request');
var fs = require('fs');
// var common = require('./common');

// http://meta.che300.com/meta/model/model_series1059.json?v=57 | http://211.90.28.102:80
var cheerio = require('cheerio');

var options = {
  url: 'http://meta.che300.com/meta/model/model_series1059.json?v=57',
  proxy: 'http://211.90.28.102:80',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36'
  }
};

request(options, function(err, response, body) {
  if (err) {
    console.log('请求失败');
    console.log(err);

    return;
  }

  if (response.statusCode !== 200) {
    console.log('响应状态：' + response.statusCode);

    return;
  }

  // 代理失败可能性
  // 1. 代理本身被查处不可用 response.request.path.indexOf('wba.htm')
  // 2. 代理返回广告页面
  // 3. 请求超时

  console.log(response.request)

  fs.writeFileSync('./tmp/test.html', body);
});
