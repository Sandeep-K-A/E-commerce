const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bannerSchema = new Schema({

    bannerMainHeader:{
        type:String
    },
    bannerDescription:{
        type:String
    },
    bannerSubDescription:{
        type:String
    },
    bannerStatus:{
        type:Boolean,
        default:true
    },
    bannerImage:{
        type:String,
        required:true
    },
    bannerLink:{
        type:String
    }
})

const banner = mongoose.model('banners',bannerSchema);
module.exports = banner;