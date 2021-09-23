const express = require('express')
const VipPlan = require('../admin/models/vipPlan')
const auth = require('../middleware/auth')
const UserMembership = require('../models/user_membership')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/membership',auth,async (req,res) => {
     try{
        const date = new Date();
        let userMembership = await UserMembership.findOne({user:req.user._id,expire:{$gte:date}})
        if(userMembership){
           return res.status(409).send({error:'Membership is already active.'})
        }
         const vipPlan = await VipPlan.findOne({_id:req.body.id})
         date.setDate(date.getDate() + vipPlan.duration);
         userMembership = new UserMembership({
            vipPlan:vipPlan._id,
            duration:vipPlan.duration,
            price:vipPlan.price,
            expire:date,
            user:req.user._id,
            payment:req.body.payment
        })
        req.user.vipExpire = date
        await req.user.save()
        await userMembership.save()
        res.send({userMembership:userMembership,message:`You have successfully purchased ${vipPlan.duration} days membership`})
   }catch(e){
       res.status(400).send({
           error:e.message
       })
   }

})

router.get('/api/membership',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }


    try{
        const itemList = await UserMembership.find({user:req.user._id},null,{
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

router.get('/api/active_membership',auth,async (req,res) => {


    try{
        const date = new Date();
        const itemList = await UserMembership.find({user:req.user._id,expire:{$gte:date}})
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})



module.exports = router
