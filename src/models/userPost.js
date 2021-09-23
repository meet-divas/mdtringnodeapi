const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    userName:{
        type:String
    },
    userPhoto:{
        type:String
    },
    userCode:{
        type:String
    },
    fileUrl:{
        type:String
    },
    fileHeight:{
        type:Number,
        default:0
    },
    message:{
        type:String
    },
    type:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        default:0
    },
    comments:{
        type:Number,
        default:0
    },
    feelingName:{
        type:String
    },
    feelingDesc:{
        type:String
    },
    feelingIcon:{
        type:Number,
        default:1
    },
    feelingType:{
        type:Number,
        default:1
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const UserPost = mongoose.model('UserPost',schema)

module.exports = UserPost