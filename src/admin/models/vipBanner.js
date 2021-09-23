const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    url:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const VipBanner = mongoose.model('VipBanner',schema)

module.exports = VipBanner