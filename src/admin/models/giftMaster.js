const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    coins:{
        type:Number,
        required:true,
        default:0
    },
    icon:{
        type:String,
        trim:true,
        required:true
    },
    type:{
        type:String,
        trim:true,
        required:true
    },
    status:{
        type:Number,
        trim:true,
        required:true,
        default:1
    }
},{
    timestamps:true
})

const GiftMaster = mongoose.model('GiftMaster',schema)

module.exports = GiftMaster

