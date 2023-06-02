const mongoose = require('mongoose')

const Schema = mongoose.Schema; 

const couponSchema = new Schema({
  CouponName:{
    type:String,
    required:true
  },
  CouponCode:{
    type:String,
    required:true
  },
  ExpiryDate:{
    type:Date,
    required:true
  },
  MinAmount:{
    type:Number,
    required:true
  },
  MaxAmount:{
    type:Number,
    required:true
  },
  Status:{
    type:Boolean,
    default:true
  },
  Percentage:{
    type:Number,
    required:true
  }

})

const coupons = mongoose.model("coupon",couponSchema)
module.exports = coupons;