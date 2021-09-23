const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const Agency = require('../models/agency')
const User = require('../../models/user')
const BeAgentRequest = require('../../models/beAgentRequest')
const AgencyWithdrawal = require('../../models/agency_wihtdrawal')
const router = new express.Router()
const randomNumber = require('../../utils/random') 
const {encrypt,decrypt} = require('../../utils/encryption')

router.post('/api/agency',auth,async (req,res) => {
    const user = new Agency(req.body)
    try{

        if(req.user.userType !== 'admin'){
            return res.status(403).send({
                error:'You are not authorised to perform this action.'
            })
        }
        const item = await Agency.findOne({$or:[{email:user.email},{mobile:user.mobile}]})
        if(item){
            return res.status(400).send({
                error:'Agency already exist.'
            })
        }
       // const password = randomNumber(100000,999999)
        const password = user.mobile
        user.password = password
        await user.generateCode()
        await user.save()
        res.status(201).send(user)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})


router.get('/api/agency',auth,async (req,res) => {
    const sort = {}
    let match = {}

    if(req.query.status){
        const status = parseInt(req.query.status.toString())
        if(status !== 10)
        match.status = status
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    console.log(match)

    try{
    
       const userList = await Agency.find(match,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        })

        res.send(userList)

    }catch(e){
        res.status(500).send({error:e.message})
     }
})


router.put('/api/agency',auth,async (req,res) => {
    
    try{
        const _id = req.body.id
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:'Unauthorized access.'})
        }
        const agency = await Agency.findOne({ _id })
          if(!agency){
              return res.status(404).send();
          }
          agency.status = parseInt(req.body.status.toString())
          await agency.save()
          res.send({status:agency.status});
   }catch(e){
       res.status(400).send(e)
   }
    
})


router.get('/api/agency/home',auth,async (req,res) => {
    try{
        const agency = await Agency.findById({_id:req.query.id})
        const agentCount = await User.countDocuments({agencyId:req.query.id})
        const agentRequestCount = await BeAgentRequest.countDocuments({agency:req.query.id,status:2})
        res.send({agency:agency,diamonds:decrypt(agency.diamonds),agentCount,agentRequestCount})
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.get('/api/agency_agent_request',auth,async (req,res) => {
    try{
        const agency = await Agency.findById({_id:req.query.id})
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await BeAgentRequest.find({agency:agency._id},null,{
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

router.get('/api/agency_agent',auth,async (req,res) => {
    try{
        const agency = await Agency.findById({_id:req.query.id})
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await User.find({agencyId:agency._id},null,{
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

router.get('/api/agency_withdrawal',auth, async (req,res) => {

    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }
    try{
           const agency = await Agency.findById({_id:req.query.id})
           const itemList = await AgencyWithdrawal.find({user:agency._id},null,{
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

// router.post('/api/agency',auth,async (req,res) => {
//     const user = new User(req.body)
//     user.password = '1234'
//     try{

//         if(req.user.userType !== 'admin'){
//             return res.status(403).send({
//                 error:'You are not authorised to perform this action.'
//             })
//         }

//         let savedUser = undefined
//         if(user.mobile){
//             savedUser = await User.findOne({mobile:user.mobile})
//         }else if(user.email){
//             savedUser = await User.findOne({email:user.email})
//         }

//         if(savedUser){
//             return res.status(400).send({
//                 error:'Agency already exist.'
//             })
//         }

//         const password = randomNumber(100000,999999)
//         user.password = password
//         await user.generateCode()

//         savedUser = await user.save()
//         res.status(201).send({user:savedUser,password})
//     }catch(e){
//        res.status(400).send(e)
//     }
// })

module.exports = router