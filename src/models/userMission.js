const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    mission:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Mission'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    target:{
        type:Number,
        default:0
    },
    completed:{
        type:Number,
        default:0
    },
    startDate:{
        type:Date
    },
    endDate:{
        type:Date
    },
    expire:{
        type:Date
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const UserMission = mongoose.model('UserMission',schema)

module.exports = UserMission