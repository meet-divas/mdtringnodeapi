const express = require('express')
const auth = require('../middleware/auth')
const LiveStream = require('../models/livestream')
const LiveStreamViewer = require('../models/liveStreamViewer')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/live_stream',auth,async (req,res) => {
    try{
         let liveStream = await LiveStream.findOne({user:req.user._id,status:1})
         if(liveStream){
            liveStream.status = 2;
            liveStream.streamEndDate = new Date()
            await liveStream.save()
         }
         liveStream = new LiveStream({
            ...req.body,
            user:req.user._id
        })
         await liveStream.save()
         res.status(201).send(liveStream)  
    }catch(e){res.status(400).send({error:e.message})}
})

router.get('/api/live_stream',auth, async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList =await LiveStream.find({status:1},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('user',['userName','photo'])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.patch('/api/live_stream/:id',auth,async (req,res) => {
    
    try{
         const liveStream = await LiveStream.findOne({streamer:req.params.id})
         if(liveStream.streamer.toString() !== req.user._id.toString()){
            return res.status(400).send({error:"You are not authorize to end this streams."})
         }
         liveStream.status = 2
         liveStream.streamEndDate = new Date()
         await liveStream.save()
         res.status(201).send(liveStream)  
    }catch(e){res.status(400).send({error:e.message})}
})


router.post('/api/live_stream_viewer',auth,async (req,res) => {
    try{
         let liveStreamViewer = await LiveStreamViewer.findOne({streamer:req.body.id,viewer:req.user._id})
         if(liveStreamViewer){
            return res.status(400).send({error:"Viewer has been already added to this stream."})
         }
         liveStreamViewer = new LiveStreamViewer({
            streamer:req.body.id,
            viewer:req.user._id
        })
         await liveStreamViewer.save()
         res.status(201).send(liveStreamViewer)  
    }catch(e){res.status(400).send({error:e.message})}
})

router.get('/api/live_stream_viewer/:id',auth, async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList =await LiveStreamViewer.find({streamer:req.params.id},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('viewer',['userName','photo'])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.delete('/api/live_stream_viewer/:id',auth,async (req,res) => {
    
    try{
         const viewer = await LiveStreamViewer.findOneAndDelete({streamer:req.params.id,viewer:req.user._id}) 
         if(viewer){
            return res.send(viewer) 
         }
         res.status(404).send({error:'Not found'})
    }catch(e){res.status(400).send({error:e.message})}
})


module.exports = router