const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    agent:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    bookingStartTime:{
        type:Date
    }, 
    bookingEndTime:{
        type:Date
    },
    duration:{
        type:Number,
        default:0
    },
    coins:{
        type:Number,
        default:0
    },
    type:{
        type:String
    },
    cancelBy:{
        type:String
    },
    reason:{
        type:String
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Booking = mongoose.model('Booking',schema)

module.exports = Booking