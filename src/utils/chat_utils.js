const checkSendMessage = (user) => {
    const date = new Date();
    if(user.vipExpire){
        const expireDate = new Date(user.vipExpire)
        if(date > expireDate){
            if(!user.freeMessage.date || user.freeMessage.date.toDateString() === date.toDateString()){
                if(user.freeMessage.counter > 0){
                    user.freeMessage.counter = user.freeMessage.counter - 1
                    return 2
                }else{
                    return 4
                }
            }else{
                user.freeMessage.date = date
                user.freeMessage.counter = 9
                return 2
            }
        }
        return 1
    }else{
        if(!user.freeMessage.date || user.freeMessage.date.toDateString() === date.toDateString()){
            if(user.freeMessage.counter > 0){
                user.freeMessage.counter = user.freeMessage.counter - 1
                return 2
            }else{
                return 3 
            }
        }else{
            user.freeMessage.date = date
            user.freeMessage.counter = 9
            return 2
        }
    } 

}


module.exports = checkSendMessage