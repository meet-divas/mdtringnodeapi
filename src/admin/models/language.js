const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
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

const Language = mongoose.model('Language',schema)

module.exports = Language