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
    comment:{
        type:String
    },
    likes:{
        type:Number,
        default:0
    },
    replyComment:[{
        type: new mongoose.Schema(
            {
                postComment:{
                    type:mongoose.Schema.Types.ObjectId,
                    required:true,
                    ref:'PostComment'
                },
                user:{
                    type:mongoose.Schema.Types.ObjectId,
                    required:true,
                    ref:'User'
                }, 
                toUser:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'User'
                },
                comment:{
                    type:String
                },likes:{
                    type:Number,
                    default:0
                },
                status:{
                    type:Number,
                    default:1
                }
            },
            { timestamps: true }
          )
    }],
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})


const PostComment = mongoose.model('PostComment',schema)

module.exports = PostComment