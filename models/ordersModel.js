const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ordersSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"usersigins"
    },
    orderId:{
        type:Number
    },
    DeliveryAddress:{
        FullName:String,
        HouseAddress:String,
        City:String,
        State:String,
        PostalCode:String,
        Phone:Number,
        Email:String
    },
    Products:[{
        proId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products"
        },
        quantity:Number,
        subTotal:Number
    }],
    PaymentMethod:{
        type:String
    },
    PaymentDetails:[{
        payment_id:String,
        order_id:String,
        payment_signature:String
    }],
    Status:{
        type:String
    },
    TotalAmount:{
        type:Number
    }

},{timestamps:true})

const orders = mongoose.model("order", ordersSchema);
module.exports = orders;