const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    target:{
        type:Number,
        required:true
    },
    days:{
        type:Number,
        required:true
    },
    icon:{
        type:String,
        trim:true,
        required:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Mission = mongoose.model('Mission',schema)

module.exports = Mission