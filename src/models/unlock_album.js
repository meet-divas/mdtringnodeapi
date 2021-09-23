const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    album:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Album'
    },
    coins:{
         type:Number
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})


const UnlockAlbum = mongoose.model('UnlockAlbum',schema)

module.exports = UnlockAlbum