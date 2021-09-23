const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    gift:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'GiftMaster'
    },
    stream:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'LiveStream'
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const UserGift = mongoose.model('UserGift',schema)

module.exports = UserGift