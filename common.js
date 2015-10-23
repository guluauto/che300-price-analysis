var request = require('request');

var SERIES_PATH = './series';
var MODEL_PATH = './models'

var ips = require('./ips.json');

var ok_ips = [];
var active_ips = [];
var tmp_ips = ips;

var req_pool = [];

var timer = setInterval(function() {
  if (!tmp_ips.length && !ok_ips.length) {
    return;
  }

  if (!active_ips.length) {
    ok_ips.forEach(function(p) {
      console.log('ip: ' + p.ip + ':' + p.port + ', 请求次数: ' + p.count);
    });
    clearInterval(timer);

    return;
  }

  if (req_pool.length) {
    var r = req_pool.shift();
    _req(r.url, r.callback);
  }
}, 500);

function _req(url, callback) {
  var p;

  if (tmp_ips.length) {
    p = tmp_ips.shift();
  } else if (ok_ips.length) {
    p = ok_ips.shift();
  } else {
    req_pool.push({
      url: url,
      callback: callback
    });
  }

  if (p.count == null) {
    p.count = 1;
  } else {
    p.count++;
  }

  active_ips.push(p);

  var options = {
    url: url,
    proxy: 'http://' + p.ip + ':' + p.port,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36'
    }
  };

  console.log(url + ' | ' + options.proxy);

  request(options, function(err, response, body) {
    if (err) {
      console.log('请求失败');
      console.log(err);

      callback.call(this, null, err);

      return;
    }

    if (response.statusCode !== 200) {
      console.log('请求失败');
      console.log('响应状态码:', response.statusCode);

      callback.call(this, null, response);
      return;
    }

    ok_ips.push(p);
    active_ips.splice(active_ips.indexOf(p), 1);

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
  req: _req,
  series_path: SERIES_PATH,
  model_path: MODEL_PATH,
  citys: CITYS
}
