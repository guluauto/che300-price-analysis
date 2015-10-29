var common = require('./common');

var Pooler = {
  total: 0,
  count: 0,
  fail: 0,
  ok: 0,
  pool: [],
  max_req_size: 30,
  duration: 100,

  add: function() {
    this.pool.push.apply(this.pool, arguments);
  },

  size: function() {
    return this.pool.length;
  },

  done: function() {},

  run: function() {
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

        common.req_proxy(xhr.url, function(body, err) {
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
}

module.exports = Pooler;
