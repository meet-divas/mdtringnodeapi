const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    streamer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    viewer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const LiveStreamViewer = mongoose.model('LiveStreamViewer',schema)

module.exports = LiveStreamViewer