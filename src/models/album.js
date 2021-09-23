const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    name:{
        type:String
    },
    desc:{
        type:String
    },
    coverUrl:{
        type:String
    },
    coins:{
        type:Number,
        default:0
    },
    photoList:[{
       type: new mongoose.Schema(
        {
            url:{
                type:String
            },
            albumId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Album'
            },
            id:{
               type:Number,
               default:0
            },
            status:{
              type:Number,
              default:1
           }
        },
        { timestamps: true }
      )

    }],
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const Album = mongoose.model('Album',schema)

module.exports = Album