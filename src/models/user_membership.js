const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    payment:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Payment'
    },
    vipPlan:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'VipPlan'
    },
    duration:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    expire:{
        type:Date,
        required:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const UserMembership = mongoose.model('UserMembership',schema)

module.exports = UserMembership