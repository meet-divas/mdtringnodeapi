const Transaction = require('../models/transaction')
const addTransaction = async (user,product,type,title,amount,mode,paymentMode) => {
      const transaction  = new Transaction()
      transaction.user = user
      transaction.product = product
      transaction.type = type
      transaction.title = title
      transaction.amount = amount
      transaction.mode = mode
      transaction.paymentMode = paymentMode
      await transaction.save()
}

module.exports = addTransaction