const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Schema = mongoose.Schema;

const productSchema = new Schema({
    
    ProductId:{
        type:Number
    },
    ProductTitle:{
        type:String,
        required:true
    },
    ProductDescription:{
        type:String,
        required:true
    },
    ProductPricing:{
        type:Number,
        required:true
    },
    ProductImages:{
        type:Array,
        // required:true
    },
    ProductCoverImages:{
        type:Array
    },
    ProductCategory:{
        type:String
    },
    ProductQuantity:{
        type:Number,
        // required:true
    },
    ProductStockStatus:{
        type:String,
        // required:true
    },
    IsDeleted:{
        type:Boolean,
        default:false  
    }
})

const products = mongoose.model("products",productSchema)
module.exports = products;


