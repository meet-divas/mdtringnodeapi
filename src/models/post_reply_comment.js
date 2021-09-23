const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    toUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    postComment:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'PostComment'
    }, 
    comment:{
        type:String
    },
    likes:{
        type:Number
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})


const PostReplyComment = mongoose.model('PostReplyComment',schema)

module.exports = PostReplyComment