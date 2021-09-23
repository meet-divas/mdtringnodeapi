const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const AdBanner = require('../../models/adbanner')
const router = require('../../routers/users')

router.post('/api/adm/adbanner',auth,async (req,res) => {
    
    try{
        const item = await AdBanner.findOne({user:req.body.user.toString()})
        if(item){
            return res.status(400).send({
                error:'Ad Banner already exist for this user'
            })
        }
        const adbanner = new AdBanner(req.body)
        await adbanner.save()
        res.status(201).send(adbanner)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

module.exports = router