var get_proxy = require('./get-proxy');
var proxyer = require('./proxyer');

var Pooler = {
  total: 0,
  count: 0,
  fail: 0,
  ok: 0,
  pool: [],
  max_req_size: 30,
  duration: 80,
  has_proxys: false,

  add: function() {
    this.pool.push.apply(this.pool, arguments);
  },

  size: function() {
    return this.pool.length;
  },

  done: function() {},

  run: function() {
    if (Pooler.has_proxys) {
      Pooler._run();

      return;
    }

    // 准备代理库
    get_proxy(function(proxys) {
      proxyer.set(proxys);

      Pooler.has_proxys = true;
      // 如果代理使用超过代理更新时间应重新获取代理
      Pooler.get_proxy_time = Date.now();

      Pooler._run();
    });
  },

  _run: function() {
    var self = this;

    var timer = setInterval(function() {
      console.log('已处理总量: ' + self.total);
      console.log('剩余量: ' + self.pool.length);
      console.log('请求中: ' + self.count);

      if (self.pool.length === 0 && self.count === 0) {
        clearInterval(timer);

        self.done();
        return;
      }

      if (self.count < self.max_req_size && self.pool.length > 0) {
        var xhr = self.pool.shift();

        self.count++;
        self.total++;

        proxyer.req(xhr.url, function(body, err) {
          self.count--;

          if (err) {
            // 有些车型在某些城市没有数据
            if (err.statusCode !== 404) {
              self.pool.push(xhr);
              self.fail++;
            }

            return;
          }

          self.ok++;
          xhr.callback(body);
        });
      }
    }, this.duration);
  }
};

module.exports = Pooler;
