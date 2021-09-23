const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    follower:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
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

const Follower = mongoose.model('Follower',schema)

module.exports = Follower

