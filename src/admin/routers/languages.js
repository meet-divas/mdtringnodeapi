const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const Language = require('../models/language')
const router = new express.Router()

router.post('/api/adm/language',auth,async (req,res) => {
    
    try{
         let language = await Language.findOne({name:req.body.name})
         if(language){
             return res.status(400).send({
                 error:'Language name is already in use.'
             })
         }

         language = new Language(req.body)
         await language.save()
         res.send(language)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/language',auth,async (req,res) => {
    
    try{
         const itemList = await Language.find()
         res.send(itemList)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

module.exports = router