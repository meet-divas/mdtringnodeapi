const admin = require('firebase-admin');
const {Storage} = require('@google-cloud/storage');

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
   // credential: admin.credential.applicationDefault(),
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://meetdivas-d14e3.firebaseio.com',
    storageBucket: 'meetdivas-d14e3.appspot.com'
  });
  
const push = async (token,body) => {

  const message = {
    data: body,
    token: token
  };

  return new Promise((resolve,reject) => {
  
      admin.messaging().send(message).then((response) => {
        // Response is a message ID string.
        //console.log('Successfully sent message:', response);
        resolve(response)
      })
      .catch((error) => {
        //console.log('Error sending message:', error);
        return reject(error)
      });
  })
    
}

const pushMulticast = async (tokens,body) => {
  const topic = 'admin'
  const message = {
    data: body,
    tokens: tokens
  };

  return new Promise((resolve,reject) => {
      admin.messaging().sendMulticast(message).then((response) => {
        resolve(response)
      })
      .catch((error) => {
        return reject(error)
      });
  })
    
}

const pushTest = async (tokens,body) => {
  const topic = 'admin'
  const message = {
    data: body,
    notification:{
       title:"MeetDivas",
       body:"This is test notification"
    },
    android: {
      notification: {
        icon: 'ic_baseline_close_24',
        color: '#7e55c3',
        clickAction: 'ManageMissionActivity',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/meetdivas-d14e3.appspot.com/o/images%2Fagent%2F60a2870a2734c32d6760bae7%2F2021_08_1309%3A54%3A33.jpg?alt=media&token=b13634e8-cb56-4d75-8873-6537c2e244e1'
      }
    },  
    tokens: tokens
  };

  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24
  };

  return new Promise((resolve,reject) => {
  
      admin.messaging().sendMulticast(message).then((response) => {
        // Response is a message ID string.
        //console.log('Successfully sent message:', response);
        resolve(response)
      })
      .catch((error) => {
        //console.log('Error sending message:', error);
        return reject(error)
      });
  })
    
}

const deleteFile = async (url) => {

  var fileRef = admin.storage().bucket()
  fileRef.get().then((data) => {
    const bucket = data[0];
    console.log("bucket found")

    const file = bucket.file(url)
    
    file.delete().then((response) =>{
      console.log("File is deleted");
    }).catch((error) =>{
      console.log('Error deleting files:', error.message);
    })

  }).catch((error) =>{
    console.log('Error getting bukcet:', error.message);
  })   
}

const deleteAlbumPhoto = async (photoList) => {

  var fileRef = admin.storage().bucket()
  fileRef.get().then((data) => {
    const bucket = data[0];
    console.log("bucket found")
    var file = {}
    photoList.forEach((photo) => {
      var res = photo.url.substring(photo.url.indexOf("images"), 
                photo.url.indexOf(".jpg")+4);
      file = bucket.file(res)
      //var response = await file.delete()
      file.delete().then((response) =>{
        console.log("File is deleted "+res);
      }).catch((error) =>{
        console.log('Error deleting files:', error.message);
      })
    })
    
  }).catch((error) =>{
    console.log('Error getting bukcet:', error.message);
  })   
}

const deleteAlbum = (name) => {
  var fileRef = admin.storage().bucket()
  fileRef.get().then((data) => {
    const bucket = data[0];
    console.log("bucket found")

    const file = bucket.file(name)
    
    file.delete().then((response) =>{
      console.log("File is deleted");
    }).catch((error) =>{
      console.log('Error deleting files:', error.message);
    })

    /*bucket.deleteFiles({
      prefix: 'images/agent/album/Singapore/2021_05_2912:08:06'
    }).then((response) =>{
      console.log('Successfully sent message:', response);
    }).catch((error) =>{
      console.log('Error deleting files:', error.message);
    })*/

  }).catch((error) =>{
    console.log('Error getting bukcet:', error.message);
  })     
}

module.exports = {push,pushMulticast,pushTest,deleteFile,deleteAlbumPhoto,deleteAlbum}