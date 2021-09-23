const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const VipPlan = require('../models/vipPlan')
const VipBanner = require('../models/vipBanner')
const router = new express.Router()


router.post('/api/adm/vip_plan',auth,async (req,res) => {
    
    try{
         const plan = new VipPlan(req.body)
         await plan.save()
         res.send(plan)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.post('/api/adm/vip_banner',auth,async (req,res) => {
    
    try{
         const vipBanner = new VipBanner(req.body)
         await vipBanner.save()
         res.send(vipBanner)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/vip_plan',auth,async (req,res) => {
    
    try{
         const itemList = await VipPlan.find()
         const bannerList = await VipBanner.find()
         res.send({vipPlanList:itemList,vipBannerList:bannerList})
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

module.exports = router