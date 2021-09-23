const express = require('express')
const auth = require('../../middleware/auth')
require('../../db/mongoose')
const Agency = require('../models/agency')
const User = require('../../models/user')
const router = new express.Router()


router.get("/api/admin/search/user",auth,async (req,res) =>{
    try{ 
        if(req.user.userType !== 'admin'){
            return res.status(403).send({
                error:'You are not authorised to perform this action.'
            })
        }

        const sort = {}
        const match = {
            userType:req.query.userType,
            $or:[
                { userName:{"$regex": req.query.query, "$options": "i"}},
                {code:{"$regex": req.query.query, "$options": "i"}},
                {mobile:{"$regex": req.query.query, "$options": "i"}},
                {email:{"$regex": req.query.query, "$options": "i"}}
            ]
        }

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const userList = await User.find(match,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).select('code userName email mobile photo createdAt updatedAt status')
        .populate('agencyId',['code','name','email','mobile'])

        res.send(userList)

    }catch(e){
        res.status(500).send({error:e.message})
    }
})

router.get("/api/admin/search/agency",auth,async (req,res) =>{
    try{
        if(req.user.userType !== 'admin'){
            return res.status(403).send({
                error:'You are not authorised to perform this action.'
            })
        }

        const sort = {}
        let code = 0
        if(isNaN(req.query.query) === false){
            code = parseInt(req.query.query)
        }
        const match = {
            $or:[
                { name:{"$regex": req.query.query, "$options": "i"}},
                {code:code},
                {mobile:{"$regex": req.query.query, "$options": "i"}},
                {email:{"$regex": req.query.query, "$options": "i"}}
            ]
        }

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

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



module.exports = router