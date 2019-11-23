const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp();
const app=require('express')();
const config = {
    apiKey: "AIzaSyBfCs2KsAq8FMjUKGbZ87MdjCivKWmGerk",
    authDomain: "connectx-e3a4e.firebaseapp.com",
    databaseURL: "https://connectx-e3a4e.firebaseio.com",
    projectId: "connectx-e3a4e",
    storageBucket: "connectx-e3a4e.appspot.com",
    messagingSenderId: "926921315384",
    appId: "1:926921315384:web:1e9296f1e5d65dabba42cd",
    measurementId: "G-NJJNGPZEF4"
  };
const firebase=require('firebase');
firebase.initializeApp(config);
const db=admin.firestore();

app.get('/scream',(req,res,next)=>{
    db.firestore()
    .collection('requests')
    .get()
    .then((data)=>{
     let screams=[];
   
     data.forEach((doc)=>{
         screams.push({
         screamId:doc.id,
          body:doc.data().body, 
       userHandle:doc.data().userHandle,
        createdAt:doc.data().createdAt
     });
         
     })
     return res.json(screams);
  }).catch((err)=>{
      console.log(err);
  })
})
 

app.post('/scream',(req,res,next)=>
{  
  const newScream={
      body:req.body.body,
      userHandle:req.body.userHandle,
      createdAt: new Date().toISOString()
  }
  db
  .collection('requests') 
  .add(newScream)
  .then((doc)=>{
     res.json({message :`document ${doc.id} created successfully`})
  })
  .catch((err)=>{
      res.status(500).json({error:'something went wrong'});
      console.log(err);
  })
})
//function To validate empty check and validation of Email 
const isEmail=(email)=>{
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx))
     return true
    else 
    return false 
}
const isEmpty=(string)=>{
    if(string.trim()==='')
     return true;
     else 
     return false;
}
//
app.post('/signup',(req,res,next)=>{
    const newUser={
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        handle:req.body.handle,

    }
    //errors{} will contain all the errors corresponding to body fields
    let errors={}
    //all else and if statements
    if(isEmpty(newUser.email))  errors.email="email must not be empty"
    else if(!isEmail)  errors.email="email is not a valid one Proceed once again"

    if(isEmpty(newUser.password))  errors.password="Password cannot be empty";
     
    if(newUser.password!==newUser.confirmPassword) errors.confirmation="passwords didn't match";
 
    if(isEmpty(newUser.handle)) errors.handle="please enter handle to specify the data allocation";

    if(Object.keys(errors).length > 0 ) return res.status(400).json(errors);
    //
    //if no errors are there then the else block will execute
    else
   { 
    let token,userId;
     db.doc(`/users/${newUser.handle}`).get()
     .then(doc=>{
     if(doc.exists)
     {
         return res.status(400).json({ handle:'this handle is already been taken' });
     }
     else{
        return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
     }
 }).then((data)=>{
     userId=data.user.uid;
     return data.user.getIdToken();

 }).then((idtoken)=>{
  token=idtoken;
  const userCredentials={
      handle: newUser.handle,
      email:newUser.email,
      createdAt:new Date().toISOString(),
      password:newUser.password,
      userId
  }
  return db.doc(`/users/${newUser.handle}`).set(userCredentials);
 })
 .then(()=>{
  return res.status(201).json({token});
 })
 .catch((err)=>{
     console.log(err);
     return res.status(500).json({hello: err.code});
 })
}
});
app.get('/deleteusers',(req,res,next)=>{
    listAllUsers();
    function listAllUsers() {
        
        admin.auth().listUsers()
          .then((listUsersResult)=> {
            listUsersResult.users.forEach((userRecord)=> {
              admin.auth().deleteUser(userRecord.uid)
             .then(function() {
               res.status(201).json('successfully deleted');
                })
                .catch(function(error) {
                    res.status(500).json('error deleting user')
               });
            });
            
          })
          .catch(function(error) {
            res.status(500).json('Error listing users:')
          });
      }
      // Start listing users from the beginning, 1000 at a time.
      
})
app.post('/login',(req,res,next)=>{
    const usercred={
        body:req.body.body,
        email:req.body.email,
        password:req.body.password
    }
    const errors={}
    if(isEmpty(usercred.email)) errors.email="email cannot be empty";
    else if(!isEmail(usercred.email)) errors.email="email is not valid";

    if(isEmpty(usercred.password)) errors.password="Password cannot be a Empty field";

    if(Object.keys(errors).length>0)
       return res.status(500).json(errors)

    firebase.auth().signInWithEmailAndPassword(usercred.email,usercred.password).then((data)=>{
        return data.user.getIdToken();
    }).then((token)=>{
        return res.json({token})
    }).catch(err=>{
        console.log(err);
        return res.status(500).json({error:err.code})
    })
})
exports.api=functions.region('asia-east2').https.onRequest(app);