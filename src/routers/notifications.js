const express = require('express')
const auth = require('../middleware/auth')
const Notification = require('../models/notification')
require('../db/mongoose') 

const router = new express.Router()


router.post('/api/notification',auth,async (req,res) => {
    const notification = new Notification({
        ...req.body,
        user:req.user._id
    })
    try{
       await notification.save()
       res.send(notification)
  }catch(e){
      res.status(400).send({
          error:e.message
      })
  }

})

router.get('/api/notification',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await Notification.find({user:req.user._id},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        })
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.get('/api/notifications',auth,async (req,res) => {

    const sort = {}
    const match = {
        userType:'admin',
        status:1
    }
    if(req.query.syncDate){
        match.updatedAt= {$gt:req.query.syncDate}
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await Notification.find(match,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('user','userName code photo')
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.get('/api/notification_count',auth,async (req,res) => {

    try{
        const count = await Notification.countDocuments({status:1})
        res.send({count:count})
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})


module.exports = router