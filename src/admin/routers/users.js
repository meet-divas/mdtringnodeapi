const express = require('express')
require('../../db/mongoose')
const User = require('../../models/user')
const Notification = require('../../models/notification')
const Album = require('../../models/album')
const BeAgentRequest = require('../../models/beAgentRequest')
const Document = require('../models/documents')
const auth = require('../../middleware/auth')
const router = new express.Router()

router.post('/api/admin/agent',auth,async (req,res) => {
    const user = new User(req.body)

    if(req.user.userType !== 'admin' && user.userType !=='agent'){
        return res.status(403).send({error:'Unauthorized access.'})
    }

    user.password = user.mobile

    try{
        let savedUser = undefined
        if(user.mobile){
            savedUser = await User.findOne({mobile:user.mobile})
        }else if(user.email){
            savedUser = await User.findOne({email:user.email})
        }

        if(savedUser){
            return res.status(400).send({
                error:'Agent already exist.'
            }) 
        }

            console.log('Saving user')
            await user.generateCode()
            await user.save()
        res.status(201).send(user)
    }catch(e){
       res.status(400).send({error:e.message})
    }
})


router.post('/api/admin/approve_agent',auth,async (req,res) => {
    const user = new User(req.body)
    user.agencyId = req.body.agency._id
    user.userName = req.body.name
    user.photo = req.body.profilePic
    user.photoStatus = 1
    user.userType = "agent"
    if(req.body.aadharPic)
    user.docList.push({
        name:'aadharPic',
        url:req.body.aadharPic,
        ext:'jpg'
    })

    if(req.body.panPic)
    user.docList.push({
        name:'panPic',
        url:req.body.panPic,
        ext:'jpg'
    })

    if(req.user.userType !== 'admin'){
        return res.status(403).send({error:'Unauthorized access.'})
    }

    user.password = user.mobile

    try{
        let savedUser = undefined
        if(user.mobile){
            savedUser = await User.findOne({mobile:user.mobile})
        }else if(user.email){
            savedUser = await User.findOne({email:user.email})
        }

        if(savedUser){
            return res.status(400).send({
                error:'Agent already exist.'
            }) 
        }

        console.log('Saving user')
        await user.generateCode()
        await user.save()
        const agentRequest =  await BeAgentRequest.findOneAndDelete({mobile:user.mobile})
        res.send({status:user.status});
    }catch(e){
       res.status(400).send({error:e.message})
    }

})

router.get('/api/admin/user',auth,async (req,res) => {
    const sort = {}
    let match = {
        userType:req.query.userType
    }

    if(req.query.status){
        match.status = parseInt(req.query.status.toString())
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    console.log(match)

    try{
    
       const userList = await User.find(match,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).select('code userName email mobile photo diamonds createdAt updatedAt status')
        .populate('agencyId',['code','name','email','mobile'])

        res.send(userList)

    }catch(e){
        res.status(500).send({error:e.message})
     }
})

router.get('/api/admin/user/:id',auth, async (req,res) => {
    const _id = req.params.id
    try{
            if(req.user.userType !== 'admin'){
                return res.status(403).send({error:'Unauthorized access.'})
            }

          if(_id === req.user._id){
            return res.send(req.user);
          }

          const user = await User.findOne({ _id })
          if(!user){
              return res.status(404).send();
          }

          const albumList = await Album.find({user:user._id},null,{
            createAt:-1
           })


          res.send({user:user,albumList:albumList});

    }catch(e){
        res.status(500).send()
    }
})

router.put('/api/admin/user',auth,async (req,res) => {
    
    try{
        const _id = req.body.id
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:'Unauthorized access.'})
        }
        const keys = Object.keys(req.body)
        const updates = keys.filter(key => key !== 'id')
        const allowedUpdates = ['albumCommission','bookingSlot','videoCallRate','audioCallRate','textChatRate','commission','ratings','status']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).send({error:'Invalid updates!'})
        }  
     
          const user = await User.findOne({ _id })
          if(!user){
              return res.status(404).send();
          }
          updates.forEach((update) => user[update] = req.body[update])
         // user.status = parseInt(req.body.status.toString())
          await user.save()
          res.send({status:user.status});
   }catch(e){
       res.status(400).send(e)
   }
    
})

router.put('/api/admin/photo',auth,async (req,res) => {
    const status = req.body.status.toString()
    const type = req.body.type.toString()
    const photoId = req.body.photoId.toString()
    const agentId = req.body.agentId.toString()
    try{
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:'Unauthorized access.'})
        }
        const user = await User.findOne({ _id:agentId })
        if(!user){
            return res.status(404).send();
         }

        if(type === 'profile'){
            const index = user.photoList.findIndex((photo,index,array) => {
                return photo._id.toString() === photoId
            })
            console.log(index)
            user.photoList[index].status = 3
        }else if(type === 'secret'){
            const index = user.secretPhotoList.findIndex((photo,index,array) => {
                return photo._id.toString() === photoId
            })
            console.log(index)
            user.secretPhotoList[index].status = 3
        }else{
            user.photoStatus = parseInt(status)
            if(parseInt(status) === 1){
                const notification = await Notification.findOneAndDelete({user:user._id,userType:'admin',
                                     type:'approveProfilePic'})
            }
                          
            //user.status = 3
        }
        await user.save()
        res.send({status:status});
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/api/admin/doc',auth,async (req,res) => {

    if(req.user.userType !== 'admin' && user.userType !=='agent'){
        return res.status(403).send({error:'Unauthorized access.'})
    }

    try{
        const user = await User.findById({_id:req.body.id.toString()})
        if(!user){
            return res.status(404).send({error:'No agent found.'})
        }
        
        const doc = {
            url:req.body.url.toString(),
            ext:req.body.ext.toString(),
            name:req.body.name.toString()
        }
        user.docList = user.docList.concat(doc)
        await user.save()
        res.status(201).send(user.docList[user.docList.length-1])
    }catch(e){
       res.status(400).send({error:e.message})
    }
})

router.delete('/api/admin/doc',auth,async (req,res) => {
    
    if(req.user.userType !== 'admin' && user.userType !=='agent'){
        return res.status(403).send({error:'Unauthorized access.'})
    }

    try{

        const user = await User.findById({_id:req.body.id.toString()})
        if(!user){
            return res.status(404).send({error:'No agent found.'})
        }
        console.log(req.body.docId.toString())
        user.docList = user.docList.filter((doc) => doc._id.toString() !== req.body.docId.toString())
        await user.save()
        res.status(201).send(true)
    }catch(e){
       res.status(400).send({error:e.message})
    }
})

module.exports = router