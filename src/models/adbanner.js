const mongoose = require('mongoose')

const schema = new mongoose.Schema({
      user:{
          type:mongoose.Schema.Types.ObjectId,
          required:true
      },
      url:{
          type:String,
          required:true
      },
      type:{
        type:String,
        required:true
     },
      status:{
          type:Number,
          default:0
      }
},{
    timestamps:true
})

const AdBanner = mongoose.model('AdBanner',schema)

module.exports = AdBanner