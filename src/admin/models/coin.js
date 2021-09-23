const mongoose = require('mongoose')

const schema = new mongoose.Schema({
      coins:{
          type:Number,
          required:true
      },
      price:{
          type:Number,
          required:true
      },
      currency:{
          type:String,
          required:true
      },
      offer:{
          type:Number,
          default:0
      },
      coinImage:{
          type:String,
          required:true
      }
},{
    timestamps:true
})

const Coin = mongoose.model('Coin',schema)

module.exports = Coin