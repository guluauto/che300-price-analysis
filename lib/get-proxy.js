var fs = require('fs');
var cheerio = require('cheerio');
var req = require('./req');
var data = require('../data');

function get_proxy(url, callback) {
  req(url, function(body, err) {
    if (body == null) {
      console.log('获取代理页面失败');

      return;
    }

    var $ = cheerio.load(body, {
      normalizeWhitespace: false,
      decodeEntities: true
    });

    var ips = [];

    // 用于计算端口
    eval($('script').eq(2).text());

    $('.tb tr').each(function(index) {
      if (index === 0) {
        return;
      }

      // 端口计算表达式
      var s = $(this).find('td').eq(2).text().replace(/^document.write\((.+)\);$/, function(match, $1) {
        return $1;
      });

      ips.push({
        ip: $(this).find('td').eq(1).text(),
        port: eval(s)
      });
    });

    callback(ips);
  }, {
    proxy: data.proxy
  });
}

function filter(ips) {
  return ips.filter(function(p) {
    return p.ip !== '0.0.0.0';
  });
}

module.exports = function(callback) {
  var high = 'http://pachong.org/high.html';
  var anonymous = 'http://pachong.org/anonymous.html';

  get_proxy(high, function(high_ips) {
    get_proxy(anonymous, function(anonymous_ips) {
      var ok_ips = filter(high_ips.concat(anonymous_ips));

      fs.writeFileSync(data.proxys_file, JSON.stringify(ok_ips));
      callback(ok_ips);
    });
  });
}
