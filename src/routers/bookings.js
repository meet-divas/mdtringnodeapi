const express = require('express')
const auth = require('../middleware/auth')
const Booking = require('../models/booking')
const {addCoins,removeCoins} = require('../common/agent_coins')
const addTransaction= require('../common/trans')
const {push} = require('../firebase/firebaseAdmin')
const changeTimezone = require('../utils/dateUtils')
const User = require('../models/user')
const CoinSummary = require('./../admin/models/coin_summary')
const {encrypt,decrypt} = require('../utils/encryption')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/booking',auth,async (req,res) => {
    const booking = new Booking({
        ...req.body,
        customer:req.user._id
    })
    try{
        const coins = booking.coins * booking.duration
        let cn = req.user.diamonds
        if(cn < coins){
            return res.status(407).send({error:"Please buy coins to book call."})   
        }
        const agent = await User.findById({_id:booking.agent})
        if(!agent){
            return res.status(404).send({error:"Agent not found."})   
        }
        const startDate = new Date(booking.bookingStartTime)
        const endDate = new Date(booking.bookingEndTime)
        const book = await Booking.findOne({agent:booking.agent,
            bookingStartTime:{"$lte": startDate},bookingEndTime:{"$gte": startDate}})
        console.log(book)
        if(book){ 
            return res.status(406).send({error:'Agent is alreday booked for this timing.'})
        }
       await booking.save()
      // req.user.diamonds = encrypt((cn - coins).toString())
       req.user.diamonds = cn - coins
      // const commision = await addCoins(agent,coins,1)
       //agent.diamonds = agent.diamonds + coins
       await req.user.save()
       //await agent.save()

        const coinSummary = await CoinSummary.findOne({status:1})
        coinSummary.customerCoins = coinSummary.customerCoins - coins
        coinSummary.meetdivasCoins = coinSummary.meetdivasCoins + coins
        await coinSummary.save()

       await addTransaction(req.user._id,booking._id,booking.type+" booked",
                            agent.userName,coins,"Debit","Coin")
      // await addTransaction(agent._id,booking._id,booking.type+" booked",
     //                      req.user.userName,commision,"Credit","Coin")
    
       res.send({_id:booking._id})
  }catch(e){
      res.status(400).send({
          error:e.message
      })
  }

})

router.get('/api/booking',auth,async (req,res) => {

    const sort = {}
    const match = {}
    if(req.user.userType ==='customer'){
        match.customer = req.user._id
    }else if(req.user.userType ==='agent'){
        match.agent = req.user._id
    }

    if(req.query.status){
        match.status = parseInt(req.query.status)
        if(match.status == 1){
            const date = new Date()
            match.bookingEndTime = {
                "$gte":date
            }
        }else if(match.status == 3){
            const date = new Date()
            match.bookingEndTime = {
                "$lte":date
            }
            match.status = 1
        }
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }


    try{
        var itemList = []
        const date = new Date()
        if(req.user.userType ==='customer'){
             itemList = await Booking.find(match,null,{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }).populate('agent',['userName','photo','code'])
        }else if(req.user.userType ==='agent'){
            itemList = await Booking.find(match,null,{
               limit:parseInt(req.query.limit),
               skip:parseInt(req.query.skip),
               sort
           }).populate('customer',['userName','photo','code'])
       }else{
             itemList = await Booking.find({},null,{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }).populate('customer',['userName','photo','code'])
            .populate('agent',['userName','photo','code'])
        }
        
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.get('/api/v1/booking',auth,async (req,res) => {

    const sort = {}
    const match = {}

    if(!req.query.loadKey || req.query.loadKey =='null'){
        req.query.loadKey = '2000-01-01'
    }

    console.log("loadkey "+req.query.loadKey)

    if(req.query.type === 'append'){
        const date = new Date(req.query.loadKey)
        match.updatedAt = {
            "$lt":date
        }
    }else {
        req.query.limit = undefined
        const date = new Date(req.query.loadKey)
        match.updatedAt = {
            "$gt":date
        }
    }

    if(req.user.userType ==='customer'){
        match.customer = req.user._id
    }else if(req.user.userType ==='agent'){
        match.agent = req.user._id
    }

    if(req.query.status){
        match.status = parseInt(req.query.status)
        const date = new Date()
        console.log("date "+date.toISOString())
        if(match.status == 1){
            match.bookingEndTime = {
                "$gte":date
            }
        }else if(match.status == 3){
            match.bookingEndTime = {
                "$lte":date
            }
            match.status = 1
        }
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }


    try{
        var itemList = []
        if(req.user.userType ==='customer'){
             itemList = await Booking.find(match,null,{
                limit:parseInt(req.query.limit),
                sort
            }).populate('agent',['userName','photo','code'])
        }else if(req.user.userType ==='agent'){
            itemList = await Booking.find(match,null,{
               limit:parseInt(req.query.limit),
               sort
           }).populate('customer',['userName','photo','code'])
       }else{
             itemList = await Booking.find({},null,{
                limit:parseInt(req.query.limit),
                sort
            }).populate('customer',['userName','photo','code'])
            .populate('agent',['userName','photo','code'])
        }
        
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.get('/api/booking/:date/:sortBy/:id',auth,async (req,res) => {

    const sort = {}

    if(req.params.sortBy){
        const parts = req.params.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const date = new Date(req.params.date)
        const nextDate = new Date(req.params.date)
        nextDate.setDate(nextDate.getDate()+1)
        console.log(date)
        console.log(nextDate)
        const itemList = await Booking.find({agent:req.params.id,
            $and: [
                {"bookingStartTime": {$gte: new Date(date)}},
                {"bookingStartTime": {$lt: new Date(nextDate)}}
                ],status:1},null,{sort
        }).populate('customer',['userName','photo','code'])
        .populate('agent',['userName','photo','code'])
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.put('/api/booking',auth, async (req,res) => {

    try{
        if(req.user.userType !== 'agent'){
            return res.status(403).send({error:'You are not authorised.'})
        }
        const booking = await Booking.findById({_id:req.body.id})
        if(!booking){
           return res.status(404).send({error:'Booking not found'})
        }
        booking.status = 2
        booking.reason = req.body.reason
        await booking.save()
        var receiver = await User.findById({_id:booking.customer})
    
        const body = {
            _id:booking._id.toString(),
            bookingStartTime:booking.bookingStartTime.toISOString(),
            bookingEndTime:booking.bookingEndTime.toISOString(),
            duration:booking.duration.toString(),
            bookingType:booking.type,
            userFromName:req.user.userName,
            userFromPic:req.user.photo,
            userFromCode:req.user.code,
            userFromId:req.user._id.toString(),
            flag:'bookingEnd'
        }
        console.log(body)
        const response = await push(receiver.fcmToken,body)
        console.log(response)
        res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
 })

router.delete('/api/booking',auth, async (req,res) => {

    try{
        const booking = await Booking.findById({_id:req.body.id})
        if(!booking){
           return res.status(404).send({error:'Booking not found'})
        }
        if(booking.status === 0){
            return res.status(406).send({error:'Booking has already been cancelled.'})
        }
        booking.status = 0
        booking.cancelBy = req.body.cancelBy
        booking.reason = req.body.reason
        await booking.save()
        var receiver = {}

        const coinSummary = await CoinSummary.findOne({status:1})
        
        if(req.user.userType === 'agent'){
            receiver = await User.findById({_id:booking.customer})
          //  receiver.diamonds = encrypt((parseInt(decrypt(receiver.diamonds)) + (booking.coins * booking.duration)).toString())
           // const commision = await removeCoins(req.user,booking.coins * booking.duration,1)
            receiver.diamonds = receiver.diamonds + (booking.coins * booking.duration)
            await receiver.save()

            coinSummary.customerCoins = coinSummary.customerCoins + (booking.coins * booking.duration)
            coinSummary.meetdivasCoins = coinSummary.meetdivasCoins - (booking.coins * booking.duration)

          //  await req.user.save()

        //  await addTransaction(req.user._id,booking._id,booking.type+" cancelled",
        //                    receiver.userName,
       //                     commision,"Debit","Coin")
          await addTransaction(receiver._id,booking._id,booking.type+" cancelled",
                           req.user.userName,
                           booking.coins * booking.duration,"Credit","Coin")

        }else{
            receiver = await User.findById({_id:booking.agent})
           // req.user.diamonds = encrypt((parseInt(decrypt(req.user.diamonds)) + (booking.coins * booking.duration * 0.7)).toString())
            req.user.diamonds = req.user.diamonds + (booking.coins * booking.duration * 0.7)
          // const commision = await removeCoins(receiver,booking.coins * booking.duration,1)
            await req.user.save()
          //  await receiver.save()

           coinSummary.customerCoins = coinSummary.customerCoins + (booking.coins * booking.duration * 0.7)
            coinSummary.meetdivasCoins = coinSummary.meetdivasCoins - (booking.coins * booking.duration * 0.7)

          await addTransaction(req.user._id,booking._id,booking.type+" cancelled",
                            receiver.userName,
                            booking.coins * booking.duration * 0.7,"Credit")
         // await addTransaction(receiver._id,booking._id,booking.type+" cancelled",
        //                   req.user.userName,
        //                   commision,"Debit")

        }
        await coinSummary.save()
        let photo = "photo"
        if(req.user.photo){
            photo =  req.user.photo
        }
        const body = {
            _id:booking._id.toString(),
            bookingStartTime:booking.bookingStartTime.toISOString(),
            bookingEndTime:booking.bookingEndTime.toISOString(),
            duration:booking.duration.toString(),
            bookingType:booking.type,
            userFromName:req.user.userName,
            userFromPic:photo,
            userFromCode:req.user.code,
            userFromId:req.user._id.toString(),
            flag:'bookingCancel'
        }
        console.log(body)
        const response = await push(receiver.fcmToken,body)
        console.log(response)
        res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
 })

module.exports = router