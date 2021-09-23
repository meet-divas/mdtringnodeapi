const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    nicename:{
        type:String,
        trim:true
    },
    iso:{
        type:String,
        trim:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Country = mongoose.model('Country',schema)

module.exports = Country