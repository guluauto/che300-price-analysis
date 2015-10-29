var request = require('request');

var SERIES_PATH = './series';
var MODEL_PATH = './models'

// 可用代理池子
var ips = require('./ips.json');
// 正在使用的代理
var active_ips = [];
// 无效的代理
var invalid_ips = [];

function req_proxy(url, callback, timeout) {
  if (!ips.length) {
    console.log('已没有可用代理');
    return;
  }

  var proxy = ips.shift();
  proxy.count = proxy.count == null ? (proxy.count + 1) : 1;
  active_ips.push(proxy);

  var options = {
    url: url,
    proxy: 'http://' + proxy.ip + ':' + proxy.port,
    timeout: timeout || 20 * 1000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36'
    }
  };

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
  })
}

function req(url, callback, timeout) {
  var options = {
    url: url,
    timeout: timeout || 20 * 1000,
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

var CITYS = [
  {
    name: '西安',
    id: 'v28c27',
    cid: '27',
    pid: '28'
  }, {
    name: '上海',
    id: 'v3c3',
    cid: '3',
    pid: '3'
  }, {
    name: '北京',
    id: 'v1c1',
    cid: '1',
    pid: '1'
  }, {
    name: '重庆',
    id: 'v4c4',
    cid: '4',
    pid: '4'
  }, {
    name: '成都',
    id: 'v22c22',
    cid: '22',
    pid: '22'
  }, {
    name: '广州',
    id: 'v20c20',
    cid: '20',
    pid: '20'
  }, {
    name: '深圳',
    id: 'v20c50',
    cid: '50',
    pid: '20'
  }, {
    name: '杭州',
    id: 'v12c12',
    cid: '12',
    pid: '12'
  }
]

module.exports = {
  req: req,
  req_proxy: req_proxy,
  series_path: SERIES_PATH,
  model_path: MODEL_PATH,
  citys: CITYS
}
