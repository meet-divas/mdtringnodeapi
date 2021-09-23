const express = require('express')
const auth = require('../middleware/auth')
const CoinSummary = require('./../admin/models/coin_summary')
const Album = require('../models/album')
const User = require('../models/user')
const {addCoins} = require('../common/agent_coins')
const addTransaction= require('../common/trans')
const {deleteFile,deleteAlbumPhoto,deleteAlbum} = require('../firebase/firebaseAdmin')
const UnlockAlbum = require('../models/unlock_album')
const {encrypt,decrypt} = require('../utils/encryption')
require('../db/mongoose') 

const router = new express.Router()


router.post('/api/album',auth,async (req,res) => {
    const album = new Album({
        ...req.body,
        user:req.user._id
    })
    try{
       await album.save()
       res.send(album)
  }catch(e){
      res.status(400).send({
          error:e.message
      })
  }

})

router.get('/api/album',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await Album.find({user:req.user._id},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        })
        res.send(itemList)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.put('/api/album',auth, async (req,res) => {

   try{
        
        const album = await Album.findById({_id:req.body.id})
        if(!album){
            return res.status(404).send({error:'Album not found'})
        }
        if(req.body.name)
        album.name = req.body.name
        if(req.body.desc)
        album.desc = req.body.desc
        if(req.body.coins)
        album.coins = req.body.coins
        if(req.body.coins)
        album.coverUrl = req.body.coverUrl
        await album.save()
        res.send(true)
   }catch(e){
       res.status(500).send({
           error:e.message
       })
   }
})

router.post('/api/album_photo',auth, async (req,res) => {

    try{
         const list = req.body.photoList
         const album = await Album.findById({_id:req.body.id})
         if(!album){
             return res.status(404).send({error:'Album not found'})
         }

         if(!album.photoList){
            album.photoList = []
          }

          const date = new Date()
         // console.log(list)
         list.forEach((url) =>{
            console.log(url)
            //album.photoList = album.photoList.concat({url})
            album.photoList.push(url)
         }) 

         await album.save()


         const photoList = album.photoList.filter((photo) => photo.createdAt >= date)

         res.send(photoList)

    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
 })

router.delete('/api/album_photo',auth, async (req,res) => {

    try{
         const photoList = req.body.photoList
         const album = await Album.findById({_id:req.body.id})
         if(!album){
             return res.status(404).send({error:'Album not found'})
         }

         const list = album.photoList.filter((item) => photoList.includes(item._id.toString()))
         album.photoList = album.photoList.filter((item) => !photoList.includes(item._id.toString()))

         await album.save()
         await deleteAlbumPhoto(list)
         /*const url = req.body.url.toString()
         var res = url.substring(url.indexOf("images"), 
                   url.indexOf(".jpg")+4);
         await deleteFile(res)*/

         res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
 })

router.delete('/api/album',auth, async (req,res) => {

    try{
         const list = req.body
         console.log(list)
         list.forEach(async (id) => {
            const album = await Album.findById({_id:id})
            if(!album){
                return 
            }
            var res = album.coverUrl.substring(album.coverUrl.indexOf("images"), 
            album.coverUrl.indexOf(".jpg")+4);
            console.log(res)

            /*res = album.coverUrl.substring(album.coverUrl.indexOf("images"), 
            album.coverUrl.indexOf(".jpg")-25);
            console.log(res)*/
            await album.delete()
            await deleteFile(res)
            if(album.photoList && album.photoList.length > 0)
            deleteAlbum(album.coverUrl.indexOf("images"), 
            album.coverUrl.indexOf(".jpg")-25)
         })

        // await Album.deleteMany({_id:{$in:list}})

         res.send(true)
    }catch(e){
        res.status(500).send({
            error:e.message
        })
    }
 })

router.post('/api/unlock_album',auth,async (req,res) => {
    try{
        let coins = req.user.diamonds
        const album = await Album.findById({_id:req.body.id})
        if(!album){
           return res.status(404).send({error:"Album not found."})
        }
        if(coins < album.coins){
            return res.status(406).send({error:"Please buy coins to unlock this album."})   
        }
       const agent = await User.findById({_id:album.user})
       if(!agent){
        return res.status(404).send({error:"Agent not found."})
       }
       const unlockAlbum = new UnlockAlbum()
       unlockAlbum.user = req.user._id
       unlockAlbum.album = album._id
       unlockAlbum.coins = album.coins
       await unlockAlbum.save()
       coins =  coins - album.coins
       req.user.diamonds = coins
       const commision = await addCoins(agent,album.coins,2)
       //agent.diamonds = agent.diamonds + (album.coins * agent.albumCommission/100)
       await req.user.save()
       await agent.save()

        const coinSummary = await CoinSummary.findOne({status:1})
        coinSummary.customerCoins = coinSummary.customerCoins - album.coins
        await coinSummary.save()
       
       await addTransaction(req.user._id,album._id,"Album unlocked",
                           agent.userName,album.coins,"Debit","Coin")
       await addTransaction(agent._id,album._id,"Album unlocked",
                           req.user.userName,commision,"Credit","Coin")

       res.send(true)
  }catch(e){
      res.status(400).send({
          error:e.message
      })
  }

})

module.exports = router