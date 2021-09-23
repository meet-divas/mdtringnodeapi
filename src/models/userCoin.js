const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    payment:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Payment'
    },
    coins:{
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

const UserCoin = mongoose.model('UserCoin',schema)

module.exports = UserCoin