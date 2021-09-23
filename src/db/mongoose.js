const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_SERVER_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
})