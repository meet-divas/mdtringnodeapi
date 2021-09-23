const express = require('express')
require('../db/mongoose')
const auth = require('../middleware/auth')
const agencyAuth = require('../middleware/agency_auth')
const CoinSummary = require('./../admin/models/coin_summary')
const Withdrawal = require('../models/withdrawal')
const User = require('../models/user')
const AgencyWithdrawal = require('../models/agency_wihtdrawal')
const Payment = require('../models/payment')
const Transaction = require('../models/transaction')
const { ObjectID } = require('mongodb')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const axios = require('axios')
const {encrypt,decrypt} = require('../utils/encryption')

const router = new express.Router()

const instance = new Razorpay({
    key_id: process.env.M_ID,
    key_secret: process.env.M_SECRET,
});

router.post('/api/payment/order',auth, async (req,res) => {

    try{
           const orderID = new ObjectID()
           var options = {
            amount: req.body.amount,  // amount in the smallest currency unit
            currency: req.body.currency,
            receipt: orderID.toString()
          };
          console.log(orderID.toString())
          const order = await instance.orders.create(options);
          console.log(order);

           const payment = new Payment()
           payment.orderId = orderID
           payment.user = req.user._id
           payment.rzrOrderId = order.id
           payment.product = req.body.product
           await payment.save()

           const transaction  = new Transaction()
            transaction.user = req.user._id
            transaction.product = payment.orderId
            transaction.type = payment.product
            transaction.title = payment.product
            transaction.amount = parseInt(req.body.amount.toString())/100
            transaction.mode = "Debit"
            transaction.paymentMode = "Online"
            transaction.status = 2
            await transaction.save()

           res.status(201).send({payment})
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.post('/api/payment/verify',auth, async (req,res) => {

    try{
           
        var generatedSignature = crypto.createHmac("SHA256",process.env.M_SECRET)
        .update(req.body.orderId + "|" + req.body.paymentId)
        .digest("hex");  
      
       var isSignatureValid = generatedSignature == req.body.signature;
       if(!isSignatureValid){
        return res.status(400).send({error:'Payment signature not verified.'})
       }
       const razorPayment = await instance.payments.fetch(req.body.paymentId)
       const payment = await Payment.findOne({rzrOrderId:req.body.orderId})
       //payment.data = JSON.stringify(razorPayment)
       payment.data = razorPayment
       await payment.save()

       const transaction  =  await Transaction.findOne({product:payment.orderId})
       if(transaction){
         if(razorPayment.status == 'authorized'){
            transaction.status = 1
            transaction.paymentMode = razorPayment.method
         }else{

         }
         transaction.product = payment._id
         await transaction.save() 
       }

       res.send({message:'Payment is successfully verified.'})

    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.get('/api/transaction',auth, async (req,res) => {

    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }
    try{
           const itemList = await Payment.find({user:req.user._id,data:{$ne:undefined}},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
          })

           res.send(itemList)
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.post('/api/withdrawal',auth, async (req,res) => {

    const withdrawal = new Withdrawal({
        ...req.body,
        user:req.user._id
     })

     console.log(withdrawal)

    try{
           
           const isMatch = await User.passwordMatching(req.user.password,req.body.password)
           if(!isMatch || req.body.code != req.user.code){
            return res.status(400).send({error:'Please provide correct user details.'})
           }

           await withdrawal.save()
           req.user.diamonds = req.user.diamonds - withdrawal.coins
           //req.user.diamonds = encrypt(coins.toString())
           await req.user.save()

           const coinSummary = await CoinSummary.findOne({status:1})
           coinSummary.agentCoins = coinSummary.agentCoins - withdrawal.coins
           coinSummary.meetdivasCoins = coinSummary.meetdivasCoins + withdrawal.coins
           await coinSummary.save()

           res.status(201).send({withdrawal:withdrawal,message:'Your request has been submitted successfully.'})
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.post('/api/agency/withdrawal',agencyAuth, async (req,res) => {

    const withdrawal = new AgencyWithdrawal({
        ...req.body,
        user:req.user._id
     })

    try{
           await withdrawal.save()
           req.user.diamonds = req.user.diamonds - withdrawal.coins
           //req.user.diamonds = encrypt(coins.toString())
           await req.user.save()

           const coinSummary = await CoinSummary.findOne({status:1})
           coinSummary.agencyCoins = coinSummary.agencyCoins - withdrawal.coins
           coinSummary.meetdivasCoins = coinSummary.meetdivasCoins + withdrawal.coins
           await coinSummary.save()


           res.status(201).send({message:'Your request has been submitted successfully.'})
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.get('/api/withdrawal',auth, async (req,res) => {

    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }
    try{
           const itemList = await Withdrawal.find({user:req.user._id.toString()},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
          })

           res.send(itemList)
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.get('/api/agency/withdrawal',agencyAuth, async (req,res) => {

    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }
    try{
           const itemList = await AgencyWithdrawal.find({user:req.user._id},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
          })

           res.send(itemList)
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.post('/api/payment/instamojo_payment_request',auth,async (req,res) => {

    try{
            const response =  await axios({
            method: 'post',
            url: 'https://test.instamojo.com/api/1.1/payment-requests/',
            data: {
                purpose: req.body.purpose,
                amount: req.body.amount,
                phone: req.body.phone,
                email:req.body.email,
                buyer_name: req.body.buyer_name,
                redirect_url:'http://usve273409.serverprofi24.com:3001/api/payment/instamojo_pay_handler',
                send_email:true,
                send_sms:true,
                allow_repeated_payments:false
            },
            headers: {
                'Content-Type':'application/json',
                'X-Api-Key': process.env.INSTAMOJO_API_KEY,
                'X-Auth-Token':process.env.INSTAMOJO_AUTH_TOKEN
                }
          });
        //const response = await axios.post('https://test.instamojo.com/api/1.1/payment-requests/',
       //                  options);
        const payment = new Payment()
        const orderID = new ObjectID()
        payment.orderId = orderID
        payment.user = req.user._id
        payment.rzrOrderId = response.data.payment_request.id
        payment.product = req.body.purpose
        payment.data = response.data
        await payment.save()

        const transaction  = new Transaction()
        transaction.user = req.user._id
        transaction.product = payment.orderId
        transaction.type = payment.product
        transaction.title = payment.product
        transaction.amount = parseInt(req.body.amount.toString())
        transaction.mode = "Debit"
        transaction.paymentMode = "Online"
        transaction.status = 2
        await transaction.save()

        console.log(response)
        res.status(201).send(response.data)
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

router.get('/api/payment/instamojo_pay_handler', async (req,res) => {

    try{
        const response = await axios.get('https://test.instamojo.com/api/1.1/payment-requests/'
                         +req.query.payment_request_id,
                         {headers: {'X-Api-Key': process.env.INSTAMOJO_API_KEY,
                        'X-Auth-Token':process.env.INSTAMOJO_AUTH_TOKEN}});


        let payment = await Payment.findOne({rzrOrderId:req.query.payment_id})
        if(payment){
            return res.status(405).send({error:"Payment data already saved.",data:response.data});
        }  
        let mobile = response.data.payment_request.phone.substring(3, 13);
        console.log(mobile)
        if(mobile === '1234567890'){
            mobile = "1"
        }
        let user = await User.findOne({mobile:mobile})  
        if(!user){
            user = await User.findOne({email:response.data.payment_request.email})  
        } 
        
        if(!user){
            return res.status(404).send({error:"User data not found."});
        } 

        console.log(user)

        //const orderID = new ObjectID()        
        payment = await Payment.findOne({rzrOrderId:req.query.payment_request_id})
       // payment.orderId = orderID
      //  payment.user = user._id
        payment.rzrOrderId = req.query.payment_id
     //   payment.product = response.data.payment_request.purpose
        payment.data = response.data
        await payment.save()  

        const transaction  =  await Transaction.findOne({product:payment.orderId})
        if(transaction){
            if(response.data.payment_request.status === "Completed"){
                transaction.status = 1
                transaction.paymentMode = response.data.payment_request.payments[0].instrument_type
            }else if(response.data.payment_request.status === "Sent"){
                transaction.status = 2
            }else {
                transaction.status = 3
            }
            transaction.product = payment._id
            await transaction.save() 
        }
        res.send(payment);
              
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }

})

module.exports = router