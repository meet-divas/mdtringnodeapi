const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    agent:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    counter:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})


const Rating = mongoose.model('Rating',schema)

module.exports = Rating