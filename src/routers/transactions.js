const express = require('express')
const auth = require('../middleware/auth')
const Transaction = require('../models/transaction')
require('../db/mongoose') 

const router = new express.Router()


router.post('/api/transactions',auth,async (req,res) => {
    const transaction = new Transaction({
        ...req.body,
        user:req.user._id
    })
    try{
       await transaction.save()
       res.send(transaction)
  }catch(e){
      res.status(400).send({
          error:e.message
      })
  }

})

router.get('/api/transactions',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await Transaction.find({user:req.user._id},null,{
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


// router.delete('/api/transaction',auth, async (req,res) => {

//     try{
//          const list = req.body
//          console.log(list)
//          list.forEach(async (id) => {
//             const transaction = await Transaction.findById({_id:id})
//             if(!transaction){
//                 return 
//             }
//             await transaction.delete()
//          })
//          res.send(true)
//     }catch(e){
//         res.status(500).send({
//             error:e.message
//         })
//     }
//  })

module.exports = router