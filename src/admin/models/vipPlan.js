const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    duration:{
        type:Number,
        required:true
    },
    offer:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const VipPlan = mongoose.model('VipPlan',schema)

module.exports = VipPlan