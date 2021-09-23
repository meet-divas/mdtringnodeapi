const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();

const app = express()
const port = process.env.PORT || 3000

const publicDir = path.join(__dirname,'../public')
app.use(express.static(publicDir))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, "views"));
app.set('view engine','ejs');

const useradminRoute = require('./routers/useradmin')
const userRoute = require('./routers/users')

const userRouteAdmin = require('./admin/routers/users')

app.use(useradminRoute)
app.use(userRoute)

app.use(userRouteAdmin)

app.listen(port,(err) => {
    if (err) console.log("Error in server setup")
    console.log('server is litening on port '+port)
})


//np
//usve273409.serverprofi24.com 
// cd /var/www/meetdivas-n*
// git pull https://github.com/vipindhama/meetdivas-nodeapi


//62.138.24.240
//vds2017x15.startdedicated.com