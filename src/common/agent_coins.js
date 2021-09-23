const User = require('../models/user')
const Agency = require('../admin/models/agency')
const UserMission = require('../models/userMission')
const CoinSummary = require('./../admin/models/coin_summary')
const {encrypt,decrypt} = require('../utils/encryption')

const addCoins = async (user,coins,type) => {
      let commission = 0
      if(type == 1){
        commission = coins * user.commission/100
      }else{
        commission = coins * user.albumCommission/100
      }

      const coinSummary = await CoinSummary.findOne({status:1})

      if(user.agencyId){
        const agency  = await Agency.findById({_id:user.agencyId})
        const agencyCommision = commission * agency.commission/100
        agency.diamonds = agency.diamonds + agencyCommision
        commission = commission - agencyCommision
        await agency.save()
        coinSummary.agencyCoins = coinSummary.agencyCoins + agencyCommision
      }
      user.diamonds = user.diamonds + commission
      await user.save()
      coinSummary.agentCoins = coinSummary.agentCoins + commission
      await coinSummary.save()
      const date = new Date()
      const userMission = await UserMission.findOne({user:user._id,expire:{$gte:date},status:1})
      if(userMission){
            userMission.completed = userMission.completed + commission
            if(userMission.completed >= userMission.target){
                 userMission.status = 2 
            }
            await userMission.save()
        }

        return commission

}

const removeCoins = async (user,coins,type) => {
    let commission = 0
    if(type == 1){
      commission = coins * user.commission/100
    }else{
      commission = coins * user.albumCommission/100
    }

    const coinSummary = await CoinSummary.findOne({status:1})

    if(user.agencyId){
      const agency  = await Agency.findById({_id:user.agencyId})
      const agencyCommision = commission * agency.commission/100
      agency.diamonds = agency.diamonds - agencyCommision
      commission = commission - agencyCommision
      await agency.save()
      coinSummary.agencyCoins = coinSummary.agencyCoins - agencyCommision
    }
    user.diamonds = user.diamonds - commission
    await user.save()

    coinSummary.agentCoins = coinSummary.agentCoins - commission
    await coinSummary.save()

    const date = new Date()
    const userMission = await UserMission.findOne({user:user._id,expire:{$gte:date},status:1})
    if(userMission){
        userMission.completed = userMission.completed - commission
        if(userMission.completed < userMission.target){
                 userMission.status = 1 
        }
         await userMission.save()
    }

    return commission
}

module.exports = {addCoins,removeCoins}