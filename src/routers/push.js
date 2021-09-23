const express = require('express')
const auth = require('../middleware/auth')
const {push,pushTest} = require('../firebase/firebaseAdmin')
const User = require('../models/user')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/push',auth,async (req,res) => {

    const body = {
          message:'This is test notification'
    }

    try{
          const token = await User.findOne({_id:req.body.id}).select('fcmToken -_id')
          push(token.fcmToken,body)
          res.send({message:'Push sent successfully.'})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})

router.post('/api/pushadmin',auth,async (req,res) => {

    const body = {
          message:'This is test notification'
    }

    try{
          const adminList = await User.find({userType:'admin'}).select('fcmToken -_id')
          const tokens = [];
          adminList.forEach((admin) =>{
                if(admin.fcmToken)
                tokens.push(admin.fcmToken)
          })
          console.log(tokens)
          pushTest(tokens,body)
          res.send({message:'Push sent successfully.'})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})


module.exports = router