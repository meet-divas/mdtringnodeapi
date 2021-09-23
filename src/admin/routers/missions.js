const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const Mission = require('../models/mission')
const router = new express.Router()

router.post('/api/adm/mission',auth,async (req,res) => {
    
    try{
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:"You are not authorised to perform this action."})
        }
         let mission = await Mission.findOne({name:req.body.name})
         if(mission){
             return res.status(400).send({
                 error:'Mission name is already in use.'
             })
         }

         mission = new Mission(req.body)
         await mission.save()
         res.send(mission)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.put('/api/adm/mission',auth,async (req,res) => {
    
    try{
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:"You are not authorised to perform this action."})
        }
         const mission = await Mission.findById({_id:req.body.id})
         if(!mission){
             return res.status(404).send({
                 error:'Mission not found.'
             })
         }
         mission.name = req.body.name
         mission.target = parseInt(req.body.target)
         mission.days = parseInt(req.body.days)
         mission.icon = req.body.icon
         await mission.save()
         res.send(mission)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.delete('/api/adm/mission/:id',auth,async (req,res) => {
    
    try{
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:"You are not authorised to perform this action."})
        }
         const mission = await Mission.findById({_id:req.params.id})
         if(!mission){
             return res.status(404).send({
                 error:'Mission not found.'
             })
         }
         await mission.delete()
         res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/mission',auth,async (req,res) => {
    const sort = {}
    
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await Mission.find({},null,{
          sort
        })

        res.send(itemList)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

module.exports = router