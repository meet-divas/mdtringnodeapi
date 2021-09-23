const express = require('express')
const { generateKeyPair } = require('crypto');
const crypto = require('crypto');
const constants = require('constants');
const router = new express.Router()
const fs = require('fs')

router.post('/generate_keys',(req,res) => {

    generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: 'top secret'
        }
      }, (err, publicKey, privateKey) => {
        // Handle errors and use the generated key pair.
        console.log("error "+err)
        console.log("private key "+privateKey)
        console.log("publicKey key "+publicKey)

        res.send(true)

      });

})

router.post('/encrypt',(req,res) =>{

    const text = req.body.name.toString()
    const publicKey = fs.readFileSync('/home/vipin/vipin_work/keys/meetdivas_pub.pem')
    const encryptedData = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(text)
      );

    res.send(encryptedData.toString('base64'))

})

router.post('/decrypt',(req,res) =>{

    const text = req.body.name
    const privateKey = fs.readFileSync('/home/vipin/vipin_work/keys/meetdivas_private.pem')

      const decryptedData = crypto.privateDecrypt(
        {
          key: privateKey,
          // In order to decrypt the data, we need to specify the
          // same hashing function and padding scheme that we used to
          // encrypt the data in the previous step
          padding: crypto.constants.RSA_PKCS1_PADDING,
         // oaepHash: "sha256",
          passphrase: 'top secret',
        },
        Buffer.from(text, 'base64')
      );
    console.log(decryptedData.toString())
    res.send({name:decryptedData.toString()})

})

module.exports = router