const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_SERVER_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.catch(error => console.log(error));