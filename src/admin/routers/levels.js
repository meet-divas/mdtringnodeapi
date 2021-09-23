const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const Level = require('../models/level')
const router = new express.Router()

router.post('/api/adm/level',auth,async (req,res) => {
    
    try{
         let level = await Level.findOne({level:req.body.level})
         if(level){
             return res.status(400).send({
                 error:'Level is already in use.'
             })
         }

         level = new Level(req.body)
         await level.save()
         res.send(level)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.put('/api/adm/level',auth,async (req,res) => {
    
    try{
         const level = await Level.findById({_id:req.body.id})
         if(!level){
             return res.status(404).send({
                 error:'Level not found.'
             })
         }
         level.followers = parseInt(req.body.followers)
         await level.save()
         res.send(level)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.delete('/api/adm/level/:id',auth,async (req,res) => {
    
    try{
         const level = await Level.findById({_id:req.params.id})
         if(!level){
             return res.status(404).send({
                 error:'Level not found.'
             })
         }
         await level.delete()
         res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/level',auth,async (req,res) => {
    
    try{
         const itemList = await Level.find({},null,{sort:{level:1}})
         res.send(itemList)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

module.exports = router