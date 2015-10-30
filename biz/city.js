var fs = require('fs');
var req = require('../lib/req');
var data = require('../data');

exports.crawl = function() {
  console.log('-- 开始抓取城市数据 --');

  req(data.city_url, function(body) {
    if (body == null) {
      console.log('抓取城市数据失败');

      return;
    }

    fs.writeFileSync(data.citys_file, body);

    var citys = JSON.parse(body);

    console.log('-- 抓取城市完成 --');
    console.log('** 城市数量: ' + citys.length + ' **');
  });
}

this.crawl();
