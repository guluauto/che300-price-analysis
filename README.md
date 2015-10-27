che300-price-analysis
=====================

che300.com 城市价格分析

## Usage

1. 创建数据库, 配置用户名密码, 在根目录创建 config.js 文件, 如下:
```javascript
module.exports = {
  mongodb: {
    name: 'che300',
    url: 'mongodb://127.0.0.1',
    port: '23456',
    user: 'username',
    pass: 'password'
  }
}
```
2. `npm start`
