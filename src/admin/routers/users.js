const express = require('express')
require('../../db/mongoose')
const User = require('../../models/user')
const auth = require('../../middleware/auth')
const router = new express.Router()


router.post('/api/admin/user',auth,async (req,res) => {
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
                error:'Celebirity already exist.'
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
        }).select('code userName email mobile photo createdAt updatedAt status')
        .populate('agencyId',['code','userName','email','mobile'])

        res.send(userList)

    }catch(e){
        res.status(500).send({error:e.message})
     }
})


module.exports = router