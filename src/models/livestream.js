const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    channelName:{
        type:String,
        trim:true,
        required:true
    },
    token:{
        type:String,
        trim:true,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    viewers:{
        type:Number,
        default:0
    },
    likes:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    streamEndDate:{
        type:Date,
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const LiveStream = mongoose.model('LiveStream',schema)

module.exports = LiveStream