const express = require('express')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

app.use(bodyParser.json())

const userSecrets = {}

app.get('/generate', (req , res) => {
    const secret = speakeasy.generateSecret({length: 20})
    const userId = 'user1'
    userSecrets[userId] = secret.base32

    qrcode.toDataURL(secret.otpauth_url, function(err, image_data) {
        if(err){
            return res.status(500).json({error: 'Error interno generando qr'})
        }
        res.json({
            userId: userId,
            secret: secret.base32,
            qrCode: image_data
        })
    })
})

app.post('/verify', (req, res) => {
    const {userId, token} = req.body

    const secret = userSecrets[userId]

    if(!secret){
        return res.status(400).json({verifed: false, error: 'invalido id'})
    }
    const verifed = speakeasy.totp.verify({
        secret:secret,
        encoding: 'base32',
        token:token
    })
    if(verifed){
        res.json({verifed: true})
    }else{
        res.json({verifed: false})
    }
})

app.listen(port, () => {
    console.log('http://localhost:3000')
})