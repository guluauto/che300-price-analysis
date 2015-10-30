var request = require('request');
var _ = require('lodash');

// 可用代理池子
var ips = [];
// 正在使用的代理
var active_ips = [];
// 无效的代理
var invalid_ips = [];

exports.set = function(proxys) {
  ips = proxys;
}

exports.req = function(url, callback, opts) {
  if (!ips.length) {
    console.log('已没有可用代理');
    return;
  }

  var proxy = ips.shift();
  proxy.count = proxy.count == null ? (proxy.count + 1) : 1;
  active_ips.push(proxy);

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

  options.proxy = 'http://' + proxy.ip + ':' + proxy.port;

  console.log(url + ' | ' + options.proxy);
  request(options, function(err, response, body) {
    active_ips.splice(active_ips.indexOf(proxy), 1);

    if (err) {
      console.log('请求失败');
      console.log(err);

      callback.call(this, null, err);
      invalid_ips.push(proxy);

      return;
    }

    if (response.statusCode !== 200) {
      console.log('请求失败');
      console.log('响应状态码:', response.statusCode);

      ips.push(proxy);
      callback.call(this, null, response);

      return;
    }

    if (response.request.path.indexOf('wba.htm') !== -1) {
      console.log('请求失败，此代理已不能用');

      callback.call(this, null, response.request.path);
      invalid_ips.push(proxy);
      return;
    }

    ips.push(proxy);
    callback.call(this, body);
  });
}
