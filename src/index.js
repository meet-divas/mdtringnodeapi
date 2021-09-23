const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const uiRoutes = require('./routers/ui/routes')
const useradminRoute = require('./routers/useradmin')
const userRoute = require('./routers/users')
const earningRoute = require('./routers/earnings')
const paymentRoute = require('./routers/payments')
const meetdivasRouter = require('./routers/meetdivas')
const postRoute = require('./routers/posts')
const liveStreamRoute = require('./routers/liveStreams')
const issueRoute = require('./routers/issues')
const missionRoute = require('./routers/userMissions')
const pushRoute = require('./routers/push')
const chatRoute = require('./routers/chat')
const membershipRoute = require('./routers/membership')
const chatUserRoute = require('./routers/chat_users')
const albumRoute = require('./routers/albums')
const bookingsRoute = require('./routers/bookings')
const transactionsRoute = require('./routers/transactions')
const notificationsRoute = require('./routers/notifications')
const postCommentsRoute = require('./routers/post_comments')

const adBannerAdmin = require('./admin/routers/adbanner')
const coinAdmin = require('./admin/routers/coins')
const giftAdmin = require('./admin/routers/gifts')
const vipPlanRoute = require('./admin/routers/vipPlans')
const coountryRoute = require('./admin/routers/countries')
const missinRouteAdmin = require('./admin/routers/missions')
const levelRouteAdmin = require('./admin/routers/levels')
const languageRouteAdmin = require('./admin/routers/languages')
const agencyRouteAdmin = require('./admin/routers/agencies')
const userRouteAdmin = require('./admin/routers/users')
const searchRouteAdmin = require('./admin/routers/search')
const postRouteAdmin = require('./admin/routers/posts')
const keyRouteAdmin = require('./admin/routers/generate_keys')

const webLinkRoute = require('./routers/weblinks')

const app = express()
const port = process.env.PORT || 3000

const publicDir = path.join(__dirname,'../public')
app.use(express.static(publicDir))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, "views"));
app.set('view engine','ejs');

app.use(uiRoutes)
app.use(useradminRoute)
app.use(userRoute)
app.use(earningRoute)
app.use(paymentRoute)
app.use(meetdivasRouter)
app.use(postRoute)
app.use(liveStreamRoute)
app.use(issueRoute)
app.use(missionRoute)
app.use(pushRoute)
app.use(chatRoute)
app.use(membershipRoute)
app.use(chatUserRoute)
app.use(albumRoute)
app.use(bookingsRoute)
app.use(notificationsRoute)
app.use(transactionsRoute)
app.use(postCommentsRoute)

//admin
app.use(adBannerAdmin)
app.use(coinAdmin)
app.use(giftAdmin)
app.use(vipPlanRoute)
app.use(coountryRoute)
app.use(missinRouteAdmin)
app.use(levelRouteAdmin)
app.use(languageRouteAdmin)
app.use(agencyRouteAdmin)
app.use(userRouteAdmin)
app.use(searchRouteAdmin)
app.use(postRouteAdmin);
app.use(keyRouteAdmin);

app.use(webLinkRoute);

app.listen(port,() => {
    console.log('server is litening on port '+port)
})


//np
//usve273409.serverprofi24.com 
// cd /var/www/meetdivas-n*
// git pull https://github.com/vipindhama/meetdivas-nodeapi


//62.138.24.240
//vds2017x15.startdedicated.com