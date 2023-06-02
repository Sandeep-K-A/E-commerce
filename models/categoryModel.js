const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name:{
        type:String
    },
    status:{
        type:Boolean,
        default:true
    }
})

const category = mongoose.model("category",categorySchema)
module.exports = category
