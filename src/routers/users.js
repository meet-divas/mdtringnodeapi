const express = require('express')
require('../db/mongoose')
const User = require('../models/user')
const BeAgentRequest = require('../models/beAgentRequest')
const auth = require('../middleware/auth')
const agencyAuth = require('../middleware/agency_auth')
const Follower = require('../models/follower')
const Album = require('../models/album')
const UnlockAlbum = require('../models/unlock_album')
const Notification = require('../models/notification')
const {push,pushMulticast} = require('../firebase/firebaseAdmin')
const router = new express.Router()
const {encrypt,decrypt} = require('../utils/encryption')


router.get('/api/logout',auth,async (req,res) => {
    try{
         req.user.accessToken = '';
         req.user.fcmToken = '';
         req.user.isOnline = 'Offline';
         await req.user.save();
         return res.send(req.user)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})


router.get('/api/user/:id',auth, async (req,res) => {
    const _id = req.params.id
    try{
          if(_id === req.user._id){
            return res.send(req.user);
          }

          const user = await User.findOne({ _id })
          if(!user){
              return res.status(404).send();
          }

          const follow = await Follower.findOne({user:_id,follower:req.user._id})
          let following = false
          if(follow){
              following = true
          }
          const albumList = await Album.find({user:_id},null,{
            createAt:-1
           })
          const unlockedAlbumList = await UnlockAlbum.find({user:req.user._id},null,{
            createAt:-1
           })
          res.send({user,following:following,albumList,unlockedAlbumList});

    }catch(e){
        res.status(500).send()
    }
})

router.get('/api/user',auth,async (req,res) => {
    const sort = {}
    let match = {
        userType:req.query.userType,
        status:parseInt(req.query.status.toString()),
        photoStatus:1
    }

    if(req.query.language && req.query.language !=='all'){
        match = {
            userType:req.query.userType,
            status:parseInt(req.query.status.toString()),
            photoStatus:1,
            "languages.language": req.query.language
        }
    }

    if(req.query.country && req.query.country !=='all'){
        match.country = req.query.country
    }

    if(req.query.ratings && req.query.ratings !=='all'){
        const ratings = req.query.ratings.toString()
        if(ratings === 'New Star'){
            match.ratings = {$gte:3.0,$lte:3.9} 
        }else if(ratings === 'Super Star'){
            match.ratings = {$gte:3.9,$lte:5.0} 
        }
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        let userList = undefined;
        if(req.query.userType === 'agent'){
            /*userList = await User.aggregate([
                {
                   $match:match
                },
                {
                    $sort:sort
                },{
                    $limit:parseInt(req.query.limit)
                },{
                    $skip:parseInt(req.query.skip)
                },{
                    $lookup:{
                        from:"followers",
                        let:{userId:req.user._id,agentId:"$_id"},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $and:[
                                            {
                                                $eq:["$user","$$agentId"]
                                                
                                            },{
                                                $eq:["$follower","$$userId"]
                                            }
                                        ]
                                    }
                                }
                            },
                            { $project: { user:0,follower:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                        ],
                        as:"follow"
                    }
                }
            ])*/

            userList = await User.find(match,["userName","photo","isOnline","country","dob"],{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            })

        }else{
            userList = await User.find(match,null,{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            })
        }

       // const size = await User.find(match,null,{})

       // res.send({limit:parseInt(req.query.limit),skip:parseInt(req.query.skip),
      //      nextPageNumber:parseInt(req.query.skip)+userList.length,data:userList})

        res.send(userList)

    }catch(e){
        res.status(500).send({error:e.message})
     }
})


router.get('/api/v1/user',auth,async (req,res) => {
    const sort = {}
    const match = {
        userType:req.query.userType,
        status:parseInt(req.query.status.toString()),
        photoStatus:1
    }

    if(req.query.ratings && req.query.ratings !=='all'){
        const ratings = req.query.ratings.toString()
        if(ratings === 'New Star'){
            match.ratings = {$gte:3.0,$lte:3.9} 
        }else if(ratings === 'Super Star'){
            match.ratings = {$gte:3.9,$lte:5.0} 
        }
    }

    if(req.query.syncDate){
        const date = new Date(req.query.syncDate)
        match.updatedAt={$gt:date}
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        let userList = undefined;
        if(req.query.userType === 'agent'){
            userList = await User.find(match,null,{
                sort,
                skip:parseInt(req.query.skip),
                limit:parseInt(req.query.limit)
            })
        }else{
            userList = await User.find(match,null,{
                sort,
                skip:parseInt(req.query.skip),
                limit:parseInt(req.query.limit)
            })
        }

        const size = await User.countDocuments(match,null,{})
        const response = {
            size:size,
            pageSize:parseInt(req.query.limit),
            pageIndex:parseInt(req.query.skip),
            nextPageNumber:parseInt(req.query.skip)+userList.length,
            data:userList 
        }

        res.send(response)

    }catch(e){
        res.status(500).send({error:e.message})
     }
})

router.post('/api/vip/user',auth,async (req,res) => {
    try{
         const date = new Date()
         const expireDate = new Date(req.body.expire)
         if(date > expireDate){
            return res.status(498).send({error:'Your plan has expired.'})
         }
         return res.send()
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.patch('/api/user',auth,async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['userName','email','password','mobile','gender','photo','level','ratings'
           ,'follower','diamonds','fcmToken','bookingSlot','callRate','videoCallRate','audioCallRate','textChatRate',
           'aboutMe','isOnline','status','userType',
        'address','state','city','zip','imeiNo']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }  

    try{
        updates.forEach(async (update) => {
            req.user[update] = req.body[update]
            if(update === 'photo'){
                req.user.photoStatus = 2
                let notification = await Notification.findOne({user:req.user._id,userType:'admin',
                            type:'approveProfilePic'})
                if(!notification){
                    notification = new Notification()
                    notification.user = req.user._id
                    notification.type = "approveProfilePic"
                    notification.userType = "admin"
                    notification.desc = req.user.userName+" changed her profile pic. Please approve new profile pic."
                    await notification.save()
                }
                const adminList = await User.find({userType:'admin'})
                const tokens = [];
                adminList.forEach((admin) =>{
                      if(admin.fcmToken)
                      tokens.push(admin.fcmToken)
                })
                const body = {
                    userId:req.user._id.toString(),
                    userName:req.user.userName,
                    photo:req.user.photo,
                    code:req.user.code,
                    type:"approveProfilePic",
                    desc:notification.desc,
                    _id:notification._id.toString(),
                    flag:"approveProfilePic"
                }
                console.log(tokens)
                pushMulticast(tokens,body)
               // console.log(response)

            }
        })
        await req.user.save()
        res.send(req.user)
   }catch(e){
       res.status(400).send(e)
   }
    
})

router.put('/api/user/password',auth,async (req,res) => {
    try{
        const isMatch = await User.passwordMatching(req.user.password,req.body.currentPassword)
        if(!isMatch){
            res.status(400).send({error:'Please provide correct current password.'})
        }else{
            req.user.password = req.body.password
            await req.user.save()
            res.send({message:'Password changed successfully.'})
        }
       
   }catch(e){
       res.status(400).send({error:e.message})
   }
    
})

router.post('/api/user/language',auth,async (req,res) => {

    try{
        const language = req.body.language.toString()
        req.user.languages = req.user.languages.concat({language})
        await req.user.save()
        res.send(req.user)
   }catch(e){
       res.status(400).send(e)
   }
    
})

router.delete('/api/user/language/:lang',auth,async (req,res) => {

    try{
        const lang = req.params.lang
        req.user.languages = req.user.languages.filter((language) => language.language !== lang)
        await req.user.save()
        res.send(req.user)
   }catch(e){
       res.status(400).send(e)
   }
    
})


router.post('/api/user/interest',auth,async (req,res) => {
    const interest = req.body.interest.toString()
    try{
          if(!req.user.interestList){
            req.user.interestList = []
          }
          req.user.interestList = req.user.interestList.concat({interest})
          await req.user.save()
          res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})


router.delete('/api/user/interest/:interest',auth,async (req,res) => {
    try{
        const interest = req.params.interest.toString()
        req.user.interestList = req.user.interestList.filter((item) => item.interest !== interest)
        await req.user.save()
        res.send(req.user)
   }catch(e){
       res.status(400).send(e)
   }
})

router.post('/api/user/photo',auth,async (req,res) => {
   // const url = req.body.url.toString()
    const list = req.body.url
    const type = req.body.type.toString()
    let size = 0
    try{
          if(type === 'profile'){
            size = req.user.photoList.length
            list.forEach((url) =>{
                req.user.photoList = req.user.photoList.concat({url})
             }) 
          }else{
            size = req.user.secretPhotoList.length
            list.forEach((url) =>{
                req.user.secretPhotoList = req.user.secretPhotoList.concat({url})
             }) 
          }
          await req.user.save()
          if(type === 'profile'){
            const photoList =  req.user.photoList.filter((photo,index) => index >= size);
            res.send(photoList)
          }else{
            const secretPhotoList =  req.user.secretPhotoList.filter((photo,index) => index >= size);
            res.send(photoList)
          }
          
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/api/user/photo/:type/:id',auth,async (req,res) => {
    const type = req.params.type
    const _id = req.params.id
    try{
        if(type === 'secret'){
            req.user.secretPhotoList = req.user.secretPhotoList.filter((item) => 
            item._id.toString() !== _id)
        }else{
            req.user.photoList = req.user.photoList.filter((item) => item._id.toString() !== _id)
        }
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/api/user_diamonds',auth,async (req,res) => {
    try{
          res.send({diamonds:req.user.diamonds})
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/user_dashboard_info',auth,async (req,res) => {
    try{
          res.send({
              diamonds: req.user.diamonds,
              ratings:req.user.ratings,
              follower:req.user.follower,
              level:req.user.level
             })
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})


router.post('/api/follow',auth,async (req,res) => {
     try{
           let follower = await Follower.findOne({user:req.body.user,follower:req.user._id})
           console.log(follower)
           if(follower){
             return res.status(400).send({error:"Follower already added."})
           }
           follower = new Follower({
               ...req.body,
               follower:req.user._id
            })
           await follower.save()
           const agent = await User.findById({_id:follower.user})
           agent.follower = agent.follower+1
           await agent.save()

           res.send(follower)
     }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

router.delete('/api/follow/:id',auth, async (req,res) => {
    try{
         const follower = await Follower.findOne({user:req.params.id,follower:req.user._id})
         if(!follower){
            return res.status(404).send({
                error:'Follower record not found.'
            }) 
         }

         await follower.remove()
         const agent = await User.findById({_id:req.params.id})
         agent.follower = agent.follower-1
         await agent.save()
         res.send(follower)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})


router.get('/api/follow',auth,async (req,res) => {
    try{
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const match = {}
       // let user = undefined
        if(req.user.userType === 'agent'){
            match.user = req.user._id
           // user = "follower"
        }else{
            match.follower = req.user._id
           // user = "user"
        }

        const itemList = await Follower.find(match,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate("user",['code','userName','photo'])
        .populate("follower",['code','userName','photo'])

        res.send(itemList)

    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})

router.post('/api/become_agent',auth,async (req,res) => {
    const user = new BeAgentRequest(req.body)
    user.password = '1234'
    try{
        let savedUser = undefined
        if(user.mobile){
            savedUser = await BeAgentRequest.findOne({mobile:user.mobile})
        }else if(user.email){
            savedUser = await BeAgentRequest.findOne({email:user.email})
        }

        if(savedUser){
            return res.status(400).send({
                error:'The requet has already submitted by this account. We are processing your request.'
            })
        }

        savedUser = await user.save()
        res.status(201).send({data:savedUser,message:'Your request has been successfully registered.'})
    }catch(e){
       res.status(400).send({
           error:e.message
       })
    }
})

router.get('/api/become_agent',auth,async (req,res) => {
    try{
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await BeAgentRequest.find(null,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('agency')

        res.send(itemList)
    }catch(e){
       res.status(400).send({
           error:e.message
       })
    }
})

router.get('/api/agency/home_page',agencyAuth,async (req,res) => {
    try{
        const agentCount = await User.count({agencyId:req.user._id})
        const agentRequestCount = await BeAgentRequest.count({agency:req.user._id,status:2})
        res.send({diamonds:req.user.diamonds,agentCount,agentRequestCount})
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.post('/api/agency/agent',agencyAuth,async (req,res) => {
    const user = new BeAgentRequest({
        ...req.body,
        agency:req.user._id
    })
   
    try{
        let savedUser = undefined
        if(user.mobile){
            savedUser = await BeAgentRequest.findOne({mobile:user.mobile})
        }else if(user.email){
            savedUser = await BeAgentRequest.findOne({email:user.email})
        }

        if(savedUser){
            return res.status(400).send({
                error:'The requet has already submitted for this account. We are processing your request.'
            })
        }

        savedUser = await user.save()
        res.status(201).send({agent:savedUser,message:'Your request has been successfully registered.'})
    }catch(e){
       res.status(400).send({
           error:e.message
       })
    }
})

router.get('/api/agency/agent_request',agencyAuth,async (req,res) => {
    try{
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await BeAgentRequest.find({agency:req.user._id},null,{
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

router.get('/api/agency/agent',agencyAuth,async (req,res) => {
    try{
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await User.find({agencyId:req.user._id},null,{
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

module.exports = router