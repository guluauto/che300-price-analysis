// 1. 页面上DOM元素获取品牌
// chrome 浏览器中执行
// var brand_els = $$('.list_1');
// var brands = brand_els.map(function(el) {
//   return {
//     name: el.innerText.substring(2),
//     id: el.id,
//     index: el.getAttribute('rel')
//   }
// });
// console.log(JSON.stringify(brands));


// 获取城市数据
// http://meta.che300.com/location/all_city.json

// 西安 v28c27
// 上海 v3c3
// 北京 v1c1
// 重庆 v4c4
// 成都 v22c22
// 广州 v20c20
// 深圳 v20c50
// 杭州 v12c12

// http://www.che300.com/pinggu/v{province_id}c{city_id}m{model_id}r{year_month}g{miles}

// http://www.kuaidaili.com/free/
// var ips = [];
// $('#list table tr').each(function() {
//   ips.push({
//     ip: $(this).find('td').eq(0).text(),
//     port: $(this).find('td').eq(1).text()
//   })
// });
//
// console.log(JSON.stringify(ips))

/// http://www.xicidaili.com/nn
// var ips = [];
//
// $('#ip_list tr').each(function(index) {
//   if (index === 0) {
//     return;
//   }
//
//   if ($(this).find('td').eq(6).text().toLowerCase() === 'http') {
//     ips.push({
//       ip: $(this).find('td').eq(2).text(),
//       port: $(this).find('td').eq(3).text()
//     })
//   }
// })
// console.log(JSON.stringify(ips))


// http://pachong.org/anonymous.html

// var ips = [];
//
// $('.tb tr').each(function(index) {
//   if (index === 0) {
//     return;
//   }
//
//
//     ips.push({
//       ip: $(this).find('td').eq(1).text(),
//       port: $(this).find('td').eq(2).text().split(';')[1]
//     })
//
// })
// console.log(JSON.stringify(ips))

var shell = require('shelljs');

var crawl_series = shell.exec('node ./series.js');
if (crawl_series.code !== 0) {
  process.exit(1);
}

var crawl_models = shell.exec('node ./models.js');
if (crawl_models.code !== 0) {
  process.exit(1);
}

var crawl_prices = shell.exec('node ./prices.js');
if (crawl_prices.code !== 0) {
  process.exit(1);
}

console.log('******************************************');
console.log('***** 恭喜您, che300 城市车价抓取全部完成 *****');
console.log('******************************************');
