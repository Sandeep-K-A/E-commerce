const mongoose = require('mongoose');
const Schema = mongoose.Schema




const cartSchema = new Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId
    },
    products:[
        {
            proId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"products"
            },
            quantity:{
                type:Number,
            },
            subTotal:{
                type:Number,
                default:0
            }

        }
    ]
    
})

const cart = mongoose.model("cart",cartSchema)
module.exports =cart;