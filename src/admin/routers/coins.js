const express = require('express')
const auth = require('../../middleware/auth')
const User = require('../../models/user')
const Agency = require('../models/agency')
require('../../db/mongoose')
const Coin = require('../models/coin')
const CoinSummary = require('../models/coin_summary')
const router = new express.Router()

router.post('/api/adm/coins',auth,async (req,res) => {
    try{
            const coin = new Coin(req.body)
            await coin.save()
            res.status(201).send(coin)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.put('/api/adm/coins',auth,async (req,res) => {
    
    try{
         const coin = await Coin.findById({_id:req.body.id})
         if(!coin){
             return res.status(404).send({
                 error:'Coin not found.'
             })
         }
         coin.coinImage = req.body.coinImage
         coin.currency = req.body.currency
         coin.offer = parseInt(req.body.offer)
         coin.price = parseInt(req.body.price)
         coin.coins = parseInt(req.body.coins)
         await coin.save()
         res.send(coin)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.delete('/api/adm/coins/:id',auth,async (req,res) => {
    
    try{
         const coin = await Coin.findById({_id:req.params.id})
         if(!coin){
             return res.status(404).send({
                 error:'Coin not found.'
             })
         }
         await coin.delete()
         res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/coins',auth,async (req,res) => {
    
    try{
         const sort = {
            coins:1 
         }
         const itemList = await Coin.find({},null,{sort})
         res.send(itemList)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/adm/coin_dashboard',auth,async (req,res) => {
    
    try{
         const sumary = await CoinSummary.findOne({status:1})
         res.send(sumary)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})


module.exports = router

