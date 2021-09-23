const express = require('express')
require('../db/mongoose')
const auth = require('../middleware/auth')
const UserMission = require('../models/userMission')
const Mission = require('../admin/models/mission')

const router = new express.Router()

router.post('/api/user_mission',auth,async (req,res) => {
    
    try{

        const mission = await Mission.findOne({_id:req.body.mission})
         if(!mission){
             return res.status(404).send({
                 error:'Mission not found.'
             })
         }

         const date = new Date()
         let userMission = await UserMission.findOne({user:req.user._id,expire:{$gte:date},status:1})
         if(userMission){
             return res.status(400).send({
                 error:'Mission is already in progress...'
             })
         }
         date.setDate(date.getDate() + mission.days)
         userMission = new UserMission({
             ...req.body,
             user:req.user._id,
             expire:date,
             target:mission.target
         })
         userMission.startDate = new Date()
         await userMission.save()
         res.send(userMission)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.patch('/api/user_mission',auth,async (req,res) => {
    
    try{
        const mission = await Mission.findOne({_id:req.body.mission})
         if(!mission){
             return res.status(404).send({
                 error:'Mission not found.'
             })
         }

         const date = new Date()
         const userMission = await UserMission.findOne({mission:req.body.mission})
         if(!userMission){
             return res.status(404).send({
                 error:'Mission not found.'
             })
         }
         userMission.startDate = date
         date.setDate(date.getDate() + mission.days)
         userMission.expire = date
         userMission.completed = 0
         userMission.endDate = undefined
         await userMission.save()
         res.send(userMission)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
})

router.get('/api/user_mission',auth,async (req,res) => {
    const sort = {}
    const match = {
        user:req.user._id
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        // const itemList = await UserMission.find(match,null,{
        //     limit:parseInt(req.query.limit),
        //     skip:parseInt(req.query.skip),
        //     sort
        // }).populate('mission')

        const itemList = await Mission.aggregate([
            {
                $sort:sort
            },{
                $lookup:{
                    from:"usermissions",
                    let:{userId:req.user._id,missionId:"$_id"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$userId"]
                                            
                                        },{
                                            $eq:["$mission","$$missionId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,mission:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"mission_started"
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