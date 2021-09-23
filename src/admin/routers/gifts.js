const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const GiftMaster = require('../models/giftMaster')
const router = new express.Router()

router.post('/api/adm/gift_master',auth,async (req,res) => {
    
    try{
         let gift = await GiftMaster.findOne({name:req.body.name})
         if(gift){
             return res.status(400).send({
                 error:'Gift name is already in use.'
             })
         }

         gift = new GiftMaster(req.body)
         await gift.save()
         res.send(gift)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.put('/api/adm/gift_master',auth,async (req,res) => {
    
    try{
         const gift = await GiftMaster.findById({_id:req.body.id})
         if(!gift){
             return res.status(404).send({
                 error:'Gift not found.'
             })
         }
         gift.name = req.body.name
         gift.icon = req.body.icon
         gift.type = req.body.type
         gift.coins = parseInt(req.body.coins)
         await gift.save()
         res.send(gift)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.delete('/api/adm/gift_master/:id',auth,async (req,res) => {
    
    try{
         const gift = await GiftMaster.findById({_id:req.params.id})
         if(!gift){
             return res.status(404).send({
                 error:'Gift not found.'
             })
         }
         await gift.delete()
         res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/gift_master',auth,async (req,res) => {
     const sort = {}
     const match = {
         status:1
     }
    if(req.query.syncDate){
        const date = new Date(req.query.syncDate)
        match.updatedAt= {$gt:date}
    }
     if(req.query.sortBy){
         const parts = req.query.sortBy.split(":")
         sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
     }

    try{
        const itemList = await GiftMaster.find(match,null,{
            sort
        })

       // const itemList = await GiftMaster.find()

        res.send(itemList)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

module.exports = router