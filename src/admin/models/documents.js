const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    url:{
        type:String,
        trim:true,
        required:true
    },
    ext:{
        type:String,
        trim:true
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Document = mongoose.model('Document',schema)

module.exports = Document