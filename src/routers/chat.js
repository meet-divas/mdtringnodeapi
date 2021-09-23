const express = require('express')
const auth = require('../middleware/auth')
const {push} = require('../firebase/firebaseAdmin')
const {addCoins} = require('../common/agent_coins')
const addTransaction= require('../common/trans')
const Transaction = require('../models/transaction')
const User = require('../models/user')
const Agency = require('../admin/models/agency')
const GiftMaster = require('../admin/models/giftMaster')
const RtcCall = require('../models/rtcCall')
const UserGift = require('../models/userGift')
const Rating = require('../models/rating')
const UserMission = require('../models/userMission')
const Message = require('../models/message')
const Booking = require('../models/booking')
const CoinSummary = require('./../admin/models/coin_summary')
const checkSendMessage = require('../utils/chat_utils')
const {encrypt,decrypt} = require('../utils/encryption')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/chat/message',auth,async (req,res) => {

    let userPhoto = "photo"
    if(req.user.photo){
        userPhoto = req.user.photo
    }

    const message = new Message({
        ...req.body,
        sender:req.user._id
    })

    let vip = "false"

    try{
         let receiver = await User.findOne({_id:req.body.receiver})
         if(receiver.fcmToken === ''){
            return res.status(406).send({error:'User is not available this time.'}) 
         }

         if(req.user.userType === 'customer'){
             let cn = req.user.diamonds
            const date = new Date()
            const match = {
                customer:req.user._id,
                agent:receiver._id,
                bookingEndTime : {"$gte":date},
                status:1
            }
            const count = await Booking.countDocuments(match)
            if(count == 0){
                const status = checkSendMessage(req.user)
                console.log(status)
                if(status === 2){
                    await req.user.save()
                }else if(status === 3){
                    return res.status(498).send({error:'Please recharge coins to send message.'}) 
                }else if(status === 4){
                    return res.status(498).send({error:'Your plan has expired. Please recharge to send message.'})
                }
            }

            if(req.user.vipExpire){
                const expireDate = new Date(req.user.vipExpire)
                if(expireDate >= date){
                    vip = "true"
                }
            }
            if(req.body.type ==='gift'){
                const giftMaster = JSON.parse(req.body.message)
                if(cn < giftMaster.coins){
                    return res.status(499).send({error:'Please recharge coins to send this gift.'}) 
                }
                const userGift = new UserGift({
                    receiver:receiver._id,
                    sender:req.user._id,
                    gift:giftMaster._id
                 })
                await userGift.save()
                const commision = await addCoins(receiver,giftMaster.coins,2)
                req.user.diamonds = cn - giftMaster.coins
                await req.user.save()

                const coinSummary = await CoinSummary.findOne({status:1})
                coinSummary.customerCoins = coinSummary.customerCoins - giftMaster.coins
                await coinSummary.save()

                await addTransaction(req.user._id,userGift._id,"Gift",
                            receiver.userName,giftMaster.coins,"Debit","Coin")
                await addTransaction(receiver._id,userGift._id,"Gift",
                           req.user.userName,commision,"Credit","Coin")

             }

         }
         
         
         await message.save()
         const body = {
            ...req.body,
            _id:message._id.toString(),
            userFromName:req.user.userName,
            userFromPic:userPhoto,
            userFromCode:req.user.code,
            userFromId:req.user._id.toString(),
            vip:vip,
            flag:'chat'
        }
          const response  = await push(receiver.fcmToken,body)
          res.send({message:message,push:response})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})

router.get('/api/chat/message',auth,async (req,res) =>{
    try{
        const sort = {}

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await Message.find({
            $or:[
                {sender:req.user._id,receiver:req.query.id},
                {receiver:req.user._id,sender:req.query.id},
            ],
            deleteByUser :{$ne:req.user._id.toString()}
        },null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        })
        .populate('sender',['userName','photo','vipExpire'])
        .populate('receiver',['userName','photo','vipExpire'])
        res.send(itemList)
    }catch(e){
        res.status(500).send({error:e.message})
    }
})

router.post('/api/chat/rtc_call',auth,async (req,res) => {

    const rtcCall = new RtcCall({
         ...req.body,
         caller:req.user._id
    })
    
    try{
        const booking = await Booking.findById({_id:req.body.booking_id})
        if(!booking){
            return res.status(406).send({error:'Booking not found.'}) 
        }
        rtcCall.bookingId = booking._id
        const customer = await User.findOne({_id:req.body.id})
        console.log(customer.diamonds)
        /*if(req.user.diamonds < agent.callRate){
            return res.status(426).send({error:'Please recharge coins to enjoy calling.'}) 
        }

        if(agent.isOnline !== 'Online'){
            return res.status(406).send({error:'User is not available.'}) 
        }*/

        if(!customer.photo){
            customer.photo = "null"
        }

        if(!req.body._id){
            await rtcCall.save()
            /*if(booking){
                booking.status = 2
                await booking.save()
            }*/
            
        }
          const body = {
            ...req.body,
            _id:rtcCall._id.toString(),
            callerCode:req.user.code,
            userRatings:req.user.ratings,
            callerId:req.user._id.toString(),
            callerName:req.user.userName,
            callerPhoto:req.user.photo,
            flag:"1"
        }
          await push(customer.fcmToken,body)
          res.send({data:rtcCall,message:'Call Signal sent successfully.'})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})

router.get('/api/chat/rtc_call',auth,async (req,res) => {
    const sort = {}
    const match = {}
    let populate = undefined
    if(req.user.userType === 'customer'){
        match.receiver = req.user._id
        populate = 'caller'
        match.status = {$ne: 7}
    }else{
        match.caller = req.user._id
        populate = 'receiver'
        match.status = {$ne: 8}
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await RtcCall.find(match,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate(populate,['code','userName','photo','ratings'])
        res.send(itemList)
    }catch(e){
        res.status(500).send({error:e.message})
    }

})

router.get('/api/chat/validate_rtc_call',auth,async (req,res) => {
    try{
        const rtcCall = await RtcCall.findOne({_id:req.query.id})
        if(!rtcCall){
            return res.status(404).send({error:'Call details not fount.'}) 
        }
        
        const date = new Date()
        const callDate = new Date(rtcCall.createdAt)
        console.log(date - callDate)
        if(date - callDate > (30 * 1000)){
             return res.send(false)
        }

        res.send(true)
    
    }catch(e){
        res.status(500).send({error:e.message})
    }
})

router.patch('/api/chat/rtc_call/:id',auth,async (req,res) => {

    let message = undefined
    let update = undefined
    if(req.body.ratings){
        update = 'ratings'
    }else if(req.body.callDuration){
        update = 'callDuration'
    }

    try{
        const rtcCall = await RtcCall.findOne({_id:req.params.id})
        const agent = await User.findOne({_id:rtcCall.caller})
        let cn = req.user.diamonds
        const booking = await Booking.findById({_id:rtcCall.bookingId})
        if(rtcCall.receiver.toString() !== req.user._id.toString()){
            return res.status(404).send({error:'Call details not found'})
        }
        if(update === 'callDuration'){
            rtcCall.callDuration = rtcCall.callDuration+1
            message = 'Call duration has been updated successfully.'
            if(rtcCall.callDuration === 1){
                rtcCall.coins = booking.coins * booking.duration
               /* await addCoins(agent,rtcCall.coins,1)
                let commission = rtcCall.coins
                if(agent.agencyId){
                    const agency = await Agency.findOne({_id:agent.agencyId})
                    if(agency){
                        const agencyCommision = (commission * agency.commission /100);
                        agency.diamonds = agency.diamonds + agencyCommision
                        commission = commission - agencyCommision
                        await agency.save()
                    }
                 }else{
                    commission = (commission * agent.commission /100);
                 }
                agent.diamonds = agent.diamonds + commission
                await agent.save()*/
            }
            if(rtcCall.callDuration > (booking.duration * 60)){
                if(rtcCall.callDuration % 60 === 0 || rtcCall.callDuration % 60 === 1){
                    if(cn < booking.coins){
                        return res.status(426).send({error:'Please recharge coins to enjoy calling.'}) 
                    }
                    rtcCall.coins = rtcCall.coins + booking.coins
                    req.user.diamonds =  cn - booking.coins
                   // const commission = await addCoins(agent,booking.coins,1)
                    /*let commission = booking.coins
                    if(agent.agencyId){
                        const agency = await Agency.findOne({_id:agent.agencyId})
                        if(agency){
                            const agencyCommision = (commission * agency.commission /100);
                            agency.diamonds = agency.diamonds + agencyCommision
                            commission = commission - agencyCommision
                            await agency.save()
                        }
                     }else{
                        commission = (commission * agent.commission /100);
                     }
                    agent.diamonds = agent.diamonds + commission
                    await agent.save()
                    const date = new Date()
                    const userMission = await UserMission.findOne({user:agent._id,expire:{$gte:date},status:1})
                    if(userMission){
                        userMission.completed = userMission.completed + commission
                        if(userMission.completed >= userMission.target){
                            userMission.status = 2 
                        }
                        await userMission.save()
                    }*/
                    await req.user.save()

                    const coinSummary = await CoinSummary.findOne({status:1})
                    coinSummary.customerCoins = coinSummary.customerCoins - booking.coins
                    await coinSummary.save()

                    let trans = await Transaction.findOne({user:req.user._id,product:booking._id})
                    trans.amount = trans.amount + booking.coins
                    trans.type = booking.type
                    trans.save()
                   // trans = await Transaction.findOne({user:agent._id,product:booking._id})
                  //  trans.amount = trans.amount + commission
                  //  trans.type = booking.type
                  //  trans.save()

                    console.log("saved..")
                }
            }
        }else{
            const ratings = parseFloat(req.body.ratings)
            rtcCall.ratings = ratings
            let rating = await Rating.findOne({user:req.user._id,agent:rtcCall.receiver})
            console.log(rating)
            if(rating){
               rating.counter = rating.counter + 1
               if(rating.counter % 3 === 0){
                  if(ratings >= 3.0){
                      agent.ratings = agent.ratings + 0.1
                  }else{
                      agent.ratings = agent.ratings - 0.1
                  }
                  await agent.save()
               }
            }else{
                rating = new Rating({
                    user:req.user._id,
                    agent:agent._id
                })
            }
            await rating.save()
            message = 'Ratings has been updated successfully.'
        } 
        
        await rtcCall.save()
        res.send({rtcCall,message,agentRatings:agent.ratings})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})

router.delete('/api/chat/rtc_call',auth,async (req,res) => {

    const DELETE_CALL_CUSTOMER = 7;
    const DELETE_CALL_AGENT = 8;

    let status = undefined
    if(req.user.userType === 'agent'){
        status = DELETE_CALL_AGENT
    }else{
        status = DELETE_CALL_CUSTOMER
    }
    
    try{
        const rtcCall = await RtcCall.findOne({_id:req.query.id})
        rtcCall.status = status
        await rtcCall.save()
        res.send({rtcCall:rtcCall,message:"Call history has been deleted successfully."})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})

router.post('/api/chat/rtc_call_signal',auth,async (req,res) => {

    const START_CALL_SIGNAL = "1";
    const RINGING_CALL_SIGNAL = "2";
    const JOIN_CALL_SIGNAL = "3";
    const REJECT_CALL_SIGNAL = "4";
    const END_CALL_SIGNAL = "5";
    const CONNECTING_CALL_SIGNAL = "6";
    const BUSY_CALL_SIGNAL = "10";

    const signal = req.body.flag.toString()

    console.log(signal)

    try{
          const rtcCall = await RtcCall.findOne({_id:req.body.id})
          let id = undefined
          if(signal === RINGING_CALL_SIGNAL 
            || signal === JOIN_CALL_SIGNAL 
            || signal === BUSY_CALL_SIGNAL){
                
              id = rtcCall.caller
              console.log('ring and join id ',id)
              if(signal === JOIN_CALL_SIGNAL){
                rtcCall.startDate = new Date()
              }
          }else{
              if(rtcCall.caller === req.user._id){
                 id = rtcCall.receiver
              }else{
                 id = req.user._id
              }
              rtcCall.endDate = new Date()
              console.log('rej and end id ',id)
          }
          rtcCall.status = signal
          await rtcCall.save()

          const body = {
            ...req.body,
            type:rtcCall.type
          }

          const token = await User.findOne({_id:id}).select('fcmToken -_id')
          await push(token.fcmToken,body)
          res.send({message:'Call Signal sent successfully.'})
    }catch(e){
        res.status(500).send({error:e.message})
    }

})



module.exports = router