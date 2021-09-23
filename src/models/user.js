const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const randomNumber = require('../utils/random')
const {encrypt,decrypt} = require('../utils/encryption')

const userSchema = new mongoose.Schema({
    socialId:{
        type:String,
    },
    agencyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Agency"
    },
    code:{
        type:String,
        required:true,
        trim:true
    },
    userName:{
        type:String,
        required:true,
        trim:true
    },password:{
        type:String,
        required:true,
        trim:true
    },email:{
        type:String,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
               throw new Error('Email is invalid') 
            }
        }
    },mobile:{
        type:String,
        trim:true,
        validate(value){
            if(!validator.isMobilePhone(value)){
               throw new Error('Mobile number is invalid') 
            }
        }
    },dob:{
        type:Date
    },gender:{
        type:String
    },address:{
        type:String
    },country:{
        type:String
    },state:{
        type:String
    },city:{
        type:String
    },zip:{
        type:String
    },imeiNo:{
        type:String
    },photo:{
        type:String
    },photoStatus:{
        type:Number,
        default:1
    },aboutMe:{
        type:String
    },level:{
        type:Number,
        default:0
    },ratings:{
        type:Number,
        default:3.0
    },bookingSlot:{
        type:String
    },videoCallRate:{
        type:Number,
        default:0
    },audioCallRate:{
        type:Number,
        default:0
    },textChatRate:{
        type:Number,
        default:0
    },commission:{
        type:Number,
        default:50
    },albumCommission:{
        type:Number,
        default:50
    },follower:{
        type:Number,
        default:0
    },diamonds:{
        type:Number,
        default:0
    },vipExpire:{
        type:Date
    },freeMessage:{
        counter:{
            type:Number,
            require:true,
            default:10,
        },
        date:{
            type:Date
        }
    },accessToken:{
        type:String,
    },fcmToken:{
        type:String
    },userType:{
        type:String,
        required:true
    },isOnline:{
        type:String,
        required:true,
        default:'offline'
    },status:{
        type:Number,
        required:true,
        default:1
    },docList:[{
        name:{
            type:String
        },
        url:{
            type:String
        },ext:{
            type:String
        },
        status:{
          type:Number,
          default:1
       }
  }],photoList:[{
          url:{
              type:String
          },
          status:{
            type:Number,
            default:1
         }
    }]
},{
    timestamps:true,
    toJSON:{
        virtuals:true
    }
})

userSchema.virtual('followers',{
    ref:'Follower',
    localField:'_id',
    foreignField:'user'
})

userSchema.virtual('following',{
    ref:'Follower',
    localField:'_id',
    foreignField:'follower'
})

userSchema.virtual('agency',{
    ref:'Agency',
    localField:'agencyId',
    foreignField:'_id'
})

// userSchema.virtual('vip').get(function(){
//     const user = this
//     const date = new Date()
//     if(user.vipExpire){
//         expireDate = new Date(user.vipExpire)
//             if(expireDate >= date){
//                 return true
//            }
//     }

//     return false
// })


userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.accessToken
    userObject.vip = false
    const date = new Date()
    if(user.vipExpire){
        expireDate = new Date(user.vipExpire)
            if(expireDate >= date){
                userObject.vip = true
            }
    }
    return userObject
}

userSchema.methods.generateCode = async function(){
    const user = this
    let code = undefined
    let codeExist = true
    while(codeExist){
        code = randomNumber(10000,999999)
        codeExist = await User.findOne({code})
    }
    user.code = code
    return code
}

userSchema.methods.generateAuthToken = async function(){
     const user = this
     const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
     user.accessToken = token
     if(!user.code){
         await user.generateCode()
     }
     console.log("generateAuthToken")
     await user.save()
     return token
}

userSchema.statics.findByCredentials = async (mobile,email,password) => {
    let user = {}
    if(mobile){
        user = await User.findOne({mobile})
    }else {
        user = await User.findOne({email})  
    }
    if(!user){
        return undefined
    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        return undefined
    }

    return user
}

userSchema.statics.passwordMatching = async (password,currentPassword) => {

    const isMatch = await bcrypt.compare(currentPassword,password)
    return isMatch
}

userSchema.pre('save',async function(next) {

     const user = this
     if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
     }

     if(!user.code){
        await user.generateCode()
     }
     console.log("in pre save "+user.diamonds+user.userName)
     next()

})

const User = mongoose.model('User',userSchema)

module.exports = User