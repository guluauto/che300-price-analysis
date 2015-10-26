var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var common = require('./common');
var record = require('./model/record');

require('./db');

CHE300_PINGGU_URL = 'http://www.che300.com/pinggu/'

// v{province_id}c{city_id}m{model_id}r{year_month}g{miles}
var now_year = new Date().getFullYear();

var count = 0;
var complete_count = 0;
var req_count = 0;
var fail_count = 0;
var ok_count = 0;
var url_pool = [];
var _data = {
  models: 0,
  records: 0
};

function _req(cb) {
  var timer = setInterval(function() {
    console.log('剩余量: ' + url_pool.length);
    console.log('请求中: ' + (req_count - complete_count));

    if (url_pool.length === 0 && complete_count === req_count) {
      clearInterval(timer);

      next();
      return;
    }

    if (count < 30 && url_pool.length > 0) {
      var xhr = url_pool.shift();

      count++;
      req_count++;

      console.log('正在处理:' + xhr.url);

      common.req(xhr.url, function(body, err) {
        count--;
        complete_count++;

        if (err) {
          url_pool.push(xhr);
          fail_count++;
          return;
        }

        ok_count++;
        xhr.callback(body);
      });
    }
  }, 500)
}

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

    console.log(doc);
  });

  // fs.appendFileSync('./rs.txt', '\n' + o);
}

function req_with_city(model) {
  common.citys.forEach(function(city) {
    var delta = now_year - parseInt(model.model_year);

    if (delta < 0) {
      delta = 0;
    }

    if (parseInt(model.model_year) === 2016){
      console.log(JSON.stringify(model));
    }

    var url = CHE300_PINGGU_URL + city.id + 'm' + model.model_id + 'r' + model.model_year + '-6g' + (2 * (delta + 1) - 1);

    // 已经抓取到的无需抓取
    record.findOne({
      model_id: model.model_id,
      city: city.name
    }, function(err, doc) {
      if (err || !doc) {
        url_pool.push({
          url: url,
          callback: function(body) {
            handler(body, model, city);
          }
        });
      }
    });
  });
}

function read_models(file) {
  var models = JSON.parse(fs.readFileSync(path.join(common.model_path, file)).toString());
  var ret = models.filter(function(model) {
    return parseInt(model.model_year) <= now_year;
  });

  ret.forEach(req_with_city);

  _data.models += ret.length;
}

var start = -5;
var files = fs.readdirSync(common.model_path);

function next() {
  start += 5;

  if (start > files.length - 5) {
    // 需抓取的总记录条数，可能有些已经抓到并存在数据库中
    _data.records = _data.models * common.citys.length;

    console.log('抓取完成，统计如下:')
    console.log('** 车款量: ' + _data.models);
    console.log('** 记录量: ' + _data.records);
    console.log('** 剩余量: ' + url_pool.length);
    console.log('** 失败量: ' + fail_count);
    console.log('** 成功量: ' + ok_count);
    record.count({}, function(err, count) {
      console.log('** 数据库: ' + count);
    });

    // fs.writeFileSync('./data.json', JSON.stringify(_data));
    return;
  }

  console.log('** 处理批次 ' + (start / 5 + 1) + ' **');

  var model_files = files.splice(start, 5);
  model_files.forEach(read_models);

  _req();
}

next();
