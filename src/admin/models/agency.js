const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const randomNumber = require('../../utils/random') 
const {encrypt,decrypt} = require('../../utils/encryption')

const agencySchema = new mongoose.Schema({
    code:{
        type:Number,
        required:true,
        unique:true
    },
    name:{
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
    },password:{
        type:String,
        required:true,
        trim:true
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
    },diamonds:{
        type:String,
        default:'28298631dcde97db06ed782026952791:02599a6c629a466a7eec579205d4b8c4'
    },commission:{
        type:Number,
        default:30
    },accessToken:{
        type:String,
    },fcmToken:{
        type:String
    },status:{
        type:Number,
        required:true,
        default:1
    }
},{
    timestamps:true
})

agencySchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.accessToken
    if(userObject.diamonds)
    userObject.diamonds = decrypt(userObject.diamonds)
    return userObject
}

agencySchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.accessToken = token
    await user.save()
    return token
}

agencySchema.methods.generateCode = async function(){
    const user = this
    let code = undefined
    let codeExist = true
    while(codeExist){
        code = randomNumber(10000,999999)
        codeExist = await Agency.findOne({code})
    }
    user.code = code
    return code
}

agencySchema.statics.findByCredentials = async (mobile,email,password) => {
   let user = {}
   if(mobile){
       user = await Agency.findOne({mobile})
   }else {
       user = await Agency.findOne({email})  
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

agencySchema.statics.passwordMatching = async (password,currentPassword) => {

   const isMatch = await bcrypt.compare(currentPassword,password)
   return isMatch
}

agencySchema.pre('save',async function(next) {

    const user = this
    if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8)
    }

    console.log(user.code)

    next()

})


const Agency = mongoose.model('Agency',agencySchema)

module.exports = Agency


//password vipinsuper19 844391