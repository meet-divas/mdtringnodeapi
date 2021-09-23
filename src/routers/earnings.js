const express = require('express')
const auth = require('../middleware/auth')
const agencyAuth = require('../middleware/agency_auth')
const UserGift = require('../models/userGift')
const UserCoin = require('../models/userCoin')
const CoinSummary = require('./../admin/models/coin_summary')
const {encrypt,decrypt} = require('../utils/encryption')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/user_coin',auth,async (req,res) => {
     const userCoin = new UserCoin({
         ...req.body,
         user:req.user._id
     })
     try{
        await userCoin.save()
        req.user.diamonds = req.user.diamonds + userCoin.coins
        await req.user.save()
        const coinSummary = await CoinSummary.findOne({status:1})
        coinSummary.customerCoins = coinSummary.customerCoins + userCoin.coins
        coinSummary.totalCoinsIssued = coinSummary.totalCoinsIssued + userCoin.coins
        await coinSummary.save()
        res.send({coin:userCoin,message:`You have successfully purchased ${userCoin.coins} coins`})
   }catch(e){
       res.status(400).send({
           error:e.message
       })
   }

})

router.get('/api/user_coin',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }


    try{
        const itemList = await UserCoin.find({},null,{
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

router.get('/api/total_coins',auth,async (req,res) => {
    try{
        res.send({diamonds:req.user.diamonds})
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.post('/api/user_gift',auth,async (req,res) => {
    const userGift = new UserGift({
        ...req.body,
        sender:req.user._id
    })
    try{
       await userGift.save()
       res.send(userGift)
  }catch(e){
      res.status(400).send({
          error:e.message
      })
  }
})

router.get('/api/user_gift',auth,async (req,res) => {
    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }


    try{
        // const itemList = await UserGift.find({receiver:req.user._id},null,{
        //     limit:parseInt(req.query.limit),
        //     skip:parseInt(req.query.skip),
        //     sort
        // }).populate('gift').populate('sender',['userName','photo'])

        const itemList = await UserGift.aggregate([
            {
                $sort:sort
            },
            { $match: { receiver:req.user._id } },
            { $group: { _id: "$gift",sender:{$first:"$sender"},
            gift:{$first:"$gift"},count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "giftmasters",
                    localField: "gift",
                    foreignField: "_id",
                    as: "gift"
               }
            }
        ])

        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})


module.exports = router
