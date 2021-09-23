const mongoose = require('mongoose')

const schema = new mongoose.Schema({
      customerCoins:{
          type:Number,
          default:0
      },
      agentCoins:{
          type:Number,
          default:0
      },
      agencyCoins:{
        type:Number,
        default:0
      },
      meetdivasCoins:{
          type:Number,
          default:0
      },
      totalCoinsIssued:{
        type:Number,
        default:0
      },
      status:{
        type:Number,
        default:1
    }
},{
    timestamps:true
})

const CoinSummary = mongoose.model('CoinSummary',schema)

module.exports = CoinSummary