const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    userpost:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'UserPost'
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})


const PostLike = mongoose.model('PostLike',schema)

module.exports = PostLike