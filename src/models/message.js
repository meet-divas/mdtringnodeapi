const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    receiver:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:'User'
    },
    message:{
      type:String,
      required:true
   },
    messageDate:{
      type:Date,
      required:true
   },
    type:{
        type:String,
        required:true
    },
    fileUrl:{
        type:String
     },
     dateShow:{
        type:Boolean,
        required:true
    },
    deleteByUser:{
      type:String
   },
    messageStatus:{
       type:String,
       default:'S'
    },
      status:{
          type:Number,
          default:1
      }
},{
    timestamps:true
})

const Message = mongoose.model('Message',schema)

module.exports = Message