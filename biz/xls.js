var fs = require('fs');
var path = require('path');
var glob = require('glob');
var xlsx = require('xlsx-stream');
var record = require('../model/record');
var data = require('../data');

require('../db');

var x = xlsx();
x.pipe(fs.createWriteStream(data.excel_file));

function tb_head() {
  data.citys.sort(function(a, b) {
    if (a.name > b.name) {
      return 1;
    }

    if (a.name < b.name) {
      return -1;
    }

    if (a.name === b.name) {
      return 0;
    }
  });

  var headers = ['车款id', '车款', '年份', '公里', '排放标准'];

  data.citys.forEach(function(city) {
    headers.push(city.name + '-车商收购价');
    headers.push(city.name + '-个人交易价')
    headers.push(city.name + '-车商零售价')
  });

  headers.push('差价 - 车商收购价');
  headers.push('百分比 - 车商收购价');
  headers.push('差价 - 个人交易价');
  headers.push('百分比 - 个人交易价');
  headers.push('差价 - 车商零售价');
  headers.push('百分比 - 车商零售价');

  x.write(headers);
}

var now_year = new Date().getFullYear();

function get_model_ids() {
  var files = glob.sync(path.relative(data.root, path.join(data.model_path, '*.json')));
  var models = [];

  files.forEach(function(file) {
    var _models = require(path.resolve(data.root, file));

    // 过滤 2015 年后的车
    var ret = _models.filter(function(model) {
      return parseInt(model.model_year) <= now_year;
    });

    models = models.concat(ret.map(function(model) {
      return model.model_id;
    }));
  });

  return models;
}

function calc(records, key) {
  var ret = [];

  records.forEach(function(r) {
    if (r[key] !== 'NaN') {
      ret.push(r);
    }
  });

  ret.sort(function(a, b) {
    var a_p = parseFloat(a[key]) * 100;
    var b_p = parseFloat(b[key]) * 100;

    if (a_p - b_p > 0) {
      return 1;
    }

    if (a_p - b_p < 0) {
      return -1;
    }

    return 0;
  });

  var max = Math.round(parseFloat(ret[ret.length - 1][key]) * 100);
  var min = Math.round(parseFloat(ret[0][key]) * 100);
  var delta = (max - min) / 100;
  var percentage = Math.round(delta * 100 / min * 10000) / 100;

  return [delta, percentage + '%'];
}

var total = 0;
var ok = 0;

function query(models) {
  models.forEach(function(model_id) {
    return record
      .find({
        model_id: model_id
      })
      .limit(20)
      .exec(function(err, docs) {
        total--;

        if (!docs.length) {
          return;
        }

        var r = [];

        docs.sort(function(a, b) {
          if (a.city > b.city) {
            return 1;
          }

          if (a.city < b.city) {
            return -1;
          }

          if (a.city === b.city) {
            return 0;
          }
        });

        r.push(docs[0].model_id);
        r.push(docs[0].model_name);
        r.push(docs[0].year);
        r.push((now_year - parseInt(docs[0].year) + 1) * 2 - 1);
        r.push(docs[0].pf);

        data.citys.forEach(function(city) {
          var _docs = docs.filter(function(doc) {
            return doc.city == city.name
          });

          if (!_docs || !_docs.length) {
            // 车商收购价
            r.push(null);
            // 个人交易价
            r.push(null);
            // 车商零售价
            r.push(null);
          } else {
            var doc = _docs[0];

            // 车商收购价
            r.push(doc.dealer_price);
            // 个人交易价
            r.push(doc.person_price);
            // 车商零售价
            r.push(doc.dealer_retial_prices);
          }
        });

        r = r.concat(calc(docs, 'dealer_price'));
        r = r.concat(calc(docs, 'person_price'));
        r = r.concat(calc(docs, 'dealer_retial_prices'));

        ok++;
        x.write(r);
      });
  });
}

exports.run = function() {
  var models = get_model_ids();
  var len = models.length;
  total = len;

  console.log('车型总量: ' + len);

  query(models);

  var timer = setInterval(function() {
    if (total === 0) {
      x.end();

      var ok_percentage = Math.round(ok / len * 100);
      console.log('成功写入 excel ' + ok + '款车, 写入比例 ' + ok_percentage + '%');

      clearInterval(timer);
    }

    var handle_percentage = Math.round((len - total) / len * 100);
    console.log('已处理' + handle_percentage + '%');
  }, 3000);
}

this.run();
