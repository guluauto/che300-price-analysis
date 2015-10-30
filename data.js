var path = require('path');

var citys = [
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
];

var root = __dirname;

module.exports = {
  root: root,
  series_path: path.resolve(root, './tmp/series'),
  model_path: path.resolve(root, './tmp/models'),
  citys_file: path.resolve(root, './tmp/city.json'),
  brands_file: path.resolve(root, './tmp/brands.json'),
  excel_file: path.resolve(root, './tmp/result.xlsx'),
  crawl_price_pos_file: path.resolve(root, './tmp/_pos.txt'),
  proxys_file: path.resolve(root, './tmp/ips.json'),

  // 需要抓取的 8 个城市
  citys: citys,
  // 抓取代理页面需要翻墙.....
  proxy: 'http://192.168.0.109:1080',

  home_url: 'http://www.che300.com/',
  city_url: 'http://meta.che300.com/location/all_city.json',

  // 根据品牌获取车系
  // 车300车系获取地址: http://meta.che300.com/meta/series/series_brand{brand_id}.json?v=55
  build_series_url: function(brand_id) {
    return 'http://meta.che300.com/meta/series/series_brand' + brand_id + '.json?v=55';
  },

  // 根据车系获取车款
  // 车款获取地址: http://meta.che300.com/meta/model/model_series213.json?v=55
  build_model_url: function(series_id) {
    return 'http://meta.che300.com/meta/model/model_series' + series_id + '.json?v=57'
  },

  // 车价评估 path 为 v{province_id}c{city_id}m{model_id}r{year_month}g{miles}
  build_pinggu_url: function(cid, mid, year, miles) {
    return 'http://www.che300.com/pinggu/' + cid + 'm' + mid + 'r' + year + '-6g' + miles;
  }
}
