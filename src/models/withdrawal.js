const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    coins:{
        type:Number,
        min:100,
        required:true
    },
    amount:{
        type:Number,
        required:true,
        default:0
    },
    status:{
        type:Number,
        trim:true,
        required:true,
        default:1
    }
},{
    timestamps:true
})


const Withdrawal = mongoose.model('Withdrawal',schema)

module.exports = Withdrawal