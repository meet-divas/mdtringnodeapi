const jwt = require('jsonwebtoken')
const Agency = require('../admin/models/agency')
const {encrypt,decrypt} = require('../utils/encryption')

const auth = async (req,res,next) => {

    try{
        const token = req.header('Authorization').replace('Bearer ','')  
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await Agency.findOne({ _id:decoded._id,accessToken:token })

        if(!user){
            throw new Error()
        }

        if(user.status === 3){
            res.status(403).send({error:'Your account has been deactivated. Please contact us.'})
        }

        req.accessToken = token
        req.user = user
        next()

    }catch(e){
       res.status(401).send({error:'Please authenticate.'})
    }

}

module.exports = auth