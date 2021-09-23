const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    agent:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    userpost:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserPost'
    },
    issue:{
        type:String,
        trim:true,
        required:true
    },
    desc:{
        type:String,
        trim:true,
        required:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Issue = mongoose.model('Issue',schema)

module.exports = Issue