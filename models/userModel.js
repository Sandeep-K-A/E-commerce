const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSigninSchema = new Schema({

    name:String,
    email:{
        unique: true,
        type: String,
        required: true,
        lowercase:true
    },
    phone:{
        unique: true,
        type: Number,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    status:{
        type:Boolean,
        default:true
    },
    usedCoupons:[{
        CouponCode:{
            type:String,
            ref:'coupons'
        }
    }],
    WalletAmount:{
        type:Number,
        default:0
    }
})

const userSignin = mongoose.model("usersigins",userSigninSchema);
module.exports = userSignin;