const express = require('express')
const router = new express.Router()
require('../db/mongoose')
const User = require('../models/user')
const randomstring = require("randomstring");
const Agency = require('../admin/models/agency');
const Album = require('../models/album');

router.post('/useradmin/user',async (req,res) => {
    const user = new User(req.body)

    if(user.userType !== 'customer'){
        return res.status(401).send({error:'Unauthorized access.'})
    }

    user.password = '1234'
    if(!user.userName){
        user.userName = 'Guest'
    }
    try{
        let savedUser = undefined
        if(user.mobile){
            savedUser = await User.findOne({mobile:user.mobile})
        }else if(user.email){
            savedUser = await User.findOne({email:user.email})
        }

        if(!savedUser){
            console.log('Saving user')
            await user.generateCode()
            savedUser = await user.save()
        }

        if(savedUser.userType !== 'customer'){
            return res.status(401).send({error:'Unauthorized access.'})
        }
        console.log('Diamonds user '+savedUser.diamonds)
        const token = await savedUser.generateAuthToken()
        res.status(201).send({user:savedUser,token})
    }catch(e){
       res.status(400).send({error:e.message})
    }
})

router.post('/useradmin/login',async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.mobile,req.body.email,req.body.password)
        if(!user){
            return res.status(401).send({error:'User id or password is incorrect.'})
        }

        if(user.status === 3){
            return res.status(403).send({error:'Your account has been deactivated. Please contact us.'})
        }

        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
       res.status(500).send({error:e.message})
    }
    
})

router.post('/useradmin/v1/login',async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.mobile,req.body.email,req.body.password)
        if(!user){
            return res.status(401).send({error:'User id or password is incorrect.'})
        }

        if(user.status === 3){
            return res.status(403).send({error:'Your account has been deactivated. Please contact us.'})
        }

        const albumList = await Album.find({user:user._id})

        const token = await user.generateAuthToken()
        res.send({user,token,albumList})
    }catch(e){
       res.status(500).send({error:e.message})
    }
    
})

router.post('/useradmin/login/admin',async (req,res) => {
    try{
        const user = await User.findByCredentials(undefined,req.body.email,req.body.password)
        if(!user){
           return res.status(401).send({error:'User id or password is incorrect.'})
        }
        if(user.userType != 'admin'){
            return res.status(403).send({error:'You are not authorised.'})
         }
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
       res.status(500).send({error:e.message})
    }
    
})

router.post('/useradmin/login/partner',async (req,res) => {
    try{
        const user = await Agency.findByCredentials(req.body.mobile,req.body.email,req.body.password)
        if(!user){
            res.status(401).send({error:'User id or password is incorrect.'})
        }

        if(user.status === 3){
            return res.status(403).send({error:'Your account has been deactivated. Please contact us.'})
        }
        
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
       res.status(500).send({error:e.message})
    }
    
})



module.exports = router