const functions = require('firebase-functions');




const app=require('express')();


//scream routes
const {getAllscreams}=require('./handlers/screams')
const {postScreams}=require('./handlers/screams')
const {postSignUp}=require('./handlers/users')
const {AuthMiddleware}=require('./handlers/users')
const {postLogin,uploadImage}=require('./handlers/users')


app.get('/scream',getAllscreams)
app.post('/signup',postSignUp)
app.post('/scream',AuthMiddleware,postScreams)
app.post('/login',postLogin)
app.post('/user/image',uploadImage)
 

 
//function To validate empty check and validation of Email 

//



exports.api=functions.region('asia-east2').https.onRequest(app);