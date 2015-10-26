var fs = require('fs');
var path = require('path');
var record = require('./model/record');
var common = require('./common');
var xlsx = require('node-xlsx');
require('./db');

common.citys.sort(function(a, b) {
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

common.citys.forEach(function(city) {
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

var data = [headers];
var now_year = new Date().getFullYear();

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

var files = fs.readdirSync(common.model_path);
var models = [];

files.splice(0, files.length).forEach(function(file) {
  var _models = JSON.parse(fs.readFileSync(path.join(common.model_path, file)).toString());
  models = models.concat(_models.map(function(model) {
    return model.model_id;
  }));
});

var count = models.length;
console.log(count);

var timer = setInterval(function() {
  if (count === 0) {
    var buffer = xlsx.build([{
      name: "车款价格对比",
      data: data
    }]);

    fs.writeFileSync('result.xlsx', buffer, 'binary');

    console.log('写入 excel 成功，车款量 ' + (data.length - 1));

    clearInterval(timer);
  }
}, 3000);

models.forEach(function(model_id) {
  record
    .find({
      model_id: model_id
    })
    .limit(20)
    .exec(function(err, docs) {
      count--;

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

      common.citys.forEach(function(city) {
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

      data.push(r);
    });
});
