const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    agency:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Agency"
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    gender:{
        type:String,
        required:true,
        trim:true
    },email:{
        type:String,
        unique:true,
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
        type:String
    },address:{
        type:String,
        trim:true
    },country:{
        type:String,
        trim:true
    },state:{
        type:String,
        trim:true
    },city:{
        type:String,
        trim:true
    },profilePic:{
        type:String,
        required:true
    },aadharPic:{
        type:String
    },panPic:{
        type:String
    },status:{
        type:Number,
        required:true,
        default:1
    }
},{
    timestamps:true
})


const User = mongoose.model('BeAgentRequest',userSchema)

module.exports = User