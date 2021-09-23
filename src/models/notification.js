const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    data:{
        type:mongoose.Schema.Types.Mixed
    },
    desc:{
        type:String
    },
    url:{
        type:String
    },
    type:{
        type:String
    },
    userType:{
        type:String
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Notification = mongoose.model('Notification',schema)

module.exports = Notification