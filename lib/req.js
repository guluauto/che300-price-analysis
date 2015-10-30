var request = require('request');
var _ = require('lodash');

module.exports = function(url, callback, opts) {
  var options = {
    url: url,
    timeout: 20 * 1000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36'
    }
  };

  if (opts) {
    _.extend(options, opts);
  }

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
