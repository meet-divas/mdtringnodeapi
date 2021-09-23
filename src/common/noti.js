const Notification = require('../models/notification')
const addNotification = async (user,data,desc,url,type) => {
      const notification  = new Notification()
      notification.user = user
      notification.data = data
      notification.desc = desc
      notification.url = url
      notification.type = type
      await notification.save()
}

module.exports = addNotification