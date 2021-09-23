const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    fileUrl:{
        type:String,
        required:true
    },
    message:{
        type:String
    },
    type:{
        type:String
    },
    likes:{
        type:Number,
        default:0
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})


const UserStory = mongoose.model('UserStory',schema)

module.exports = UserStory