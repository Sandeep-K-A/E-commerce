const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const adminSigninSchema = new Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true
       
    },
    password:{
        type:String,
    }
})

const adminSignin = mongoose.model("adminSignin",adminSigninSchema)
module.exports = adminSignin;