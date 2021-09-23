const express = require('express')
const auth = require('../middleware/auth')
const Issue = require('../models/issue')
const CallIssue = require('../models/callIssue')
const CallFeedback = require('../models/callFeedback')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/report_issue',auth, async (req,res) => {
    try{
        const issue = new Issue({
           ...req.body,
           user:req.user._id
       })
        await issue.save()
        res.status(201).send({message:"Issue has been submitted successully."})  
   }catch(e){res.status(400).send({error:e.message})}
})

router.post('/api/call_issue',auth, async (req,res) => {
    try{
        const issue = new CallIssue({
           ...req.body,
           user:req.user._id
       })
        await issue.save()
        res.status(201).send({message:"Issue has been submitted successully."})  
   }catch(e){res.status(400).send({error:e.message})}
})

router.post('/api/call_feedback',auth, async (req,res) => {
    try{
        const feedback = new CallFeedback({
           ...req.body,
           user:req.user._id
       })
        await feedback.save()
        res.status(201).send({message:"Feedback has been submitted successully."})  
   }catch(e){res.status(400).send({error:e.message})}
})

router.get('/api/report_issue/:id',auth, async (req,res) => {
    try{
        const itemList = await Issue.find({agent:req.params.id})
        res.status(201).send(itemList)  
   }catch(e){res.status(400).send({error:e.message})}
})

module.exports = router