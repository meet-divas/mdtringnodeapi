const express = require('express')
const auth = require('../middleware/auth')
require('../db/mongoose')
const AdBanner = require('../models/adbanner')
const Coin = require('../admin/models/coin')
const User = require('../models/user')
const {push} = require('../firebase/firebaseAdmin')
const {encrypt,decrypt} = require('../utils/encryption')
const router = new express.Router()

router.get('/api/test',async (req,res) => {
    try{
        const item = ["1","2","3"]
        const size = item.length
        item.push("4")
        item.push("5")
        item.push("6")
        item.push("7")
        const newItem = item.filter((ob,index) => index >= size)
        res.send(newItem)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})


router.get('/basic_encrypt',async (req,res) => {
    try{
        const encryptData = encrypt(req.query.value);
        res.send(encryptData)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

router.get('/api/sys_date',auth,(req,res) => {
    try{
        const date = new Date()
        res.send(date)
        
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

router.get('/api/env',async (req,res) => {
    try{
        res.send({
            mongo:process.env.MONGO_SERVER_URL,
            jwt:process.env.JWT_SECRET,
            port:process.env.PORT,
            lb2:"lb2",
            vrb:process.env.MY_VRB,
            firebase:process.env.GOOGLE_APPLICATION_CREDENTIALS,
            lb1:"lb1"
        })
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

router.get('/api/adbanner',auth,async (req,res) => {
    try{
        const itemList = await AdBanner.find()
        res.send(itemList)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

router.get('/api/coins',auth,async (req,res) => {
    try{
            const itemList = await Coin.find()
            res.send(itemList)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.post('/api/allocate_agency/:id',auth,async (req,res) => {
    try{
            const itemList = await User.find({userType:'agent'})
            itemList.forEach(async user => {
                user.agencyId = req.params.id.toString()
                if(!user.code)
                   await user.generateCode()
                await user.save()
            })
            res.send(itemList)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

module.exports = router