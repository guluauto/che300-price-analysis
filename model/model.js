var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var model = new Schema({
  model_id: String,
  model_name: String,
  model_price: String,
  model_year: String,
  min_reg_year: String,
  max_reg_year: String,
  // 排量
  liter: String,
  // 燃油类型：汽油/柴油
  liter_type: String,
  // 变速箱雷系 手动/自动
  gear_type: String,
  // 排放标准
  discharge_standard: String
});

// 返回数据给用户时，将 _id 属性重命名为 id
model.set('toObject', {
  versionKey: false,

  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Model', model);
