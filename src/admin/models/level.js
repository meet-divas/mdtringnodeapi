const mongoose = require('mongoose')

const schema = new mongoose.Schema({
      level:{
          type:Number,
          required:true
      },
      followers:{
          type:Number,
          required:true
      }
},{
    timestamps:true
})

const Level = mongoose.model('Level',schema)

module.exports = Level