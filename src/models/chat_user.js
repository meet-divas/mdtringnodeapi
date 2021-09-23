const mongoose = require('mongoose')
const Message = require('../models/message')

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
      lastMessage:{
        type:String,
        required:true
     },
      lastMessageDate:{
        type:Date,
        required:true
     },
     lastMessageRead:{
       type:String,
       required:true
    },
    unReadCounter:{
      type:Number,
      required:true,
      default:0
   },
   deleteByUser:{
     type:String
  },
   status:{
      type:Number,
       default:1
  }
},{
    timestamps:true
})

schema.pre('remove', async function(next) {
  const user = this
  await Message.remove({
    $or:[
        {sender:ruser._id},
        {receiver:user._id},
    ]
  })

  next();
});

schema.pre('save', async function(next) {
  const user = this
  if(user.isModified('deleteByUser')){

    await Message.updateMany({
      $or:[
          {sender:user.sender,receiver:user.receiver},
          {receiver:user.sender,sender:user.receiver},
      ]
    }, { deleteByUser: user.deleteByUser });
    
  }
  next();
});


const ChatUser = mongoose.model('ChatUser',schema)

module.exports = ChatUser