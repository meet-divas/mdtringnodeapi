const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        unique:true
    },
    rzrOrderId:{
        type:String,
        required:true,
        unique:true
    },
    product:{
        type:mongoose.Schema.Types.Mixed
    },
    data:{
        type:mongoose.Schema.Types.Mixed
    }
},{
    timestamps:true
})

const Payment = mongoose.model('Payment',schema)

module.exports = Payment