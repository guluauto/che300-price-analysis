var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var glob = require('glob');
var _ = require('lodash');
var common = require('./common');
var record = require('./model/record');

require('./db');

CHE300_PINGGU_URL = 'http://www.che300.com/pinggu/'

// v{province_id}c{city_id}m{model_id}r{year_month}g{miles}
var now_year = new Date().getFullYear();

var Pooler = {
  total: 0,
  count: 0,
  fail: 0,
  ok: 0,
  pool: [],
  max_pool_size: 30,
  duration: 500,

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

      if (self.count < self.max_pool_size && self.pool.length > 0) {
        var xhr = self.pool.shift();

        self.count++;
        self.total++;

        common.req(xhr.url, function(body, err) {
          self.count--;

          if (err) {
            self.pool.push(xhr);
            self.fail++;
            return;
          }

          self.ok++;
          xhr.callback(body);
        });
      }
    }, this.duration);
  }
}

var _data = {
  models: 0,
  records: 0,
  query_count: 0,
  return_count: 0
};

// 提取数据写入数据库
function handler(body, model, city) {
  var $ = cheerio.load(body);

  var pf = $('.data_span').eq(0).text().replace('排放标准：', '');
  var dealer_price = parseFloat($('.dealer_price p').eq(1).text().replace('￥', '').replace('万', ''));
  var person_price = parseFloat($('.person_price p span').text());
  var dealer_retial_prices = parseFloat($('.dealer_retial_prices p').eq(1).text().replace('￥', '').replace('万', ''));

  var o = {
    model_id: model.model_id,
    model_name: model.model_name,
    year: model.model_year,
    pf: pf,
    city: city.name,
    dealer_price: dealer_price,
    person_price: person_price,
    dealer_retial_prices: dealer_retial_prices
  };

  record.findOneAndUpdate({
    model_id: o.model_id,
    city: o.city
  }, o, {
    new: true,
    upsert: true
  }).exec(function(err, doc) {
    if (err) {
      console.log(err)
      return;
    }

    console.log(JSON.stringify(doc));
  });
}

function req_with_city(model) {
  return common.citys.map(function(city) {
    var delta = now_year - parseInt(model.model_year);
    var url = CHE300_PINGGU_URL + city.id + 'm' + model.model_id + 'r' + model.model_year + '-6g' + (2 * (delta + 1) - 1);

    // 已经抓取到的无需抓取
    return record
      .findOne({
        model_id: model.model_id,
        city: city.name
      })
      .exec(function(err, doc) {
        if (err || !doc) {
          Pooler.add({
            url: url,
            callback: function(body) {
              handler(body, model, city);
            }
          });
        } else {
          _data.return_count++;
        }
      });
  });
}

function read_models(file) {
  var models = require('./' + file);

  // 过滤 2015 年后的车
  var ret = models.filter(function(model) {
    return parseInt(model.model_year) <= now_year;
  });

  var p = ret.map(req_with_city);

  p = _.flatten(p);

  _data.models += ret.length;

  return p;
}

function dispatch_models() {
  var files = glob.sync(path.join(common.model_path, '*.json'));
  var len = files.length;
  var start = -5;
  var offset = 5;

  console.log('车款总文件数:' + files.length + ', 最后一批索引: ' + (files.length - (files.length % offset)));

  return function() {
    start += 5;

    if (start > len - (len % offset)) {
      // 需抓取的总记录条数，可能有些已经抓到并存在数据库中
      _data.records = _data.models * common.citys.length;

      console.log('抓取完成，统计如下:')
      console.log('** 车款量: ' + _data.models);
      console.log('** 记录量: ' + _data.records);
      console.log('** 剩余量: ' + Pooler.size());
      console.log('** 失败量: ' + Pooler.fail);
      console.log('** 成功量: ' + Pooler.ok);
      console.log('** 查询量: ' + _data.query_count);
      console.log('** 返回量: ' + _count);

      return false;
    }

    console.log('-- 车款文件索引: ' + start + ', 剩余车款文件量: ' + (files.length - (files.length % 5)) + ' --');
    console.log('-- 处理批次 ' + (start / offset + 1) + ' --');

    var model_files = files.splice(0, offset);
    // 将请求加入 _req 池子
    var p = model_files.map(read_models);

    p = _.flatten(p);

    return p;
  }
}



exports.crawl = function() {
  var nexter = dispatch_models();

  var start = function() {
    var p = nexter();

    if (p) {
      console.log('-- 数据库查询量: ' + p.length + '--');
      _data.query_count += p.length;

      Promise
        .all(p)
        .then(function() {
          // 启动处理池子任务
          Pooler.run();
        });
    }
  };

  Pooler.done = start;

  start();
}

this.crawl();
