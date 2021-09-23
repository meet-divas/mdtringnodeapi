const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const Country = require('../models/country')
const router = new express.Router()

router.post('/api/adm/country',auth,async (req,res) => {
    
    try{
         let country = await Country.findOne({name:req.body.name})
         if(country){
             return res.status(400).send({
                 error:'Country name is already in use.'
             })
         }

         country = new Country(req.body)
         await country.save()
         res.send(country)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/country',auth,async (req,res) => {
    
    try{
         const itemList = await Country.find()
         res.send(itemList)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

module.exports = router