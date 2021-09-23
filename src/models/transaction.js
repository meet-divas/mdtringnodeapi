const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    type:{
        type:String
    },
    title:{
        type:String
    },
    amount:{
        type:Number,
        default:0
    },
    mode:{
        type:String
    },
    paymentMode:{
        type:String
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Transaction = mongoose.model('Transaction',schema)

module.exports = Transaction