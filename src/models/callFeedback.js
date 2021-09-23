const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    call:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RtcCall'
    },
    feedback:{
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

const FeedBack = mongoose.model('FeedBack',schema)

module.exports = FeedBack