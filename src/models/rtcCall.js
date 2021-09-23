const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    caller:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Booking'
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
    optional:{
        type:String
    },
    type:{
        type:String,
        required:true
    },
    ratings:{
        type:Number,
        default:0
    },
    callDuration:{
        type:Number,
        default:0
    },
    coins:{
        type:Number,
        default:0
    },
    startDate:{
        type:Date,
    },
    endDate:{
        type:Date,
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const RtcCall = mongoose.model('RtcCall',schema)

module.exports = RtcCall