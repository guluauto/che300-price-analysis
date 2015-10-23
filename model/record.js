var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// "model_id":"24455","model_name":"2015款 奥迪A4L 30 TFSI 自动舒适型","year":"2015","pf":"国5","city":"西安","dealer_price":21.75,"person_price":23.21,"dealer_retial_prices":23.75
var record = new Schema({
  model_id: String,
  model_name: String,
  year: String,
  pf: String,
  city: String,
  dealer_price: String,
  person_price: String,
  dealer_retial_prices: String
});

// 返回数据给用户时，将 _id 属性重命名为 id
record.set('toObject', {
  versionKey: false,

  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Record', record);
