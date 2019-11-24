const {admin,db}=require('../util/admin')

const firebase=require('firebase')
const config=require('../util/config')
firebase.initializeApp(config)
const {validateSignUp,validateLogin}=require('../util/validator');



exports.AuthMiddleware=(req,res,next)=>{
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken=req.headers.authorization.split('Bearer ')[1];
    }
    else{
        console.log('No Token found');
        return res.status(403).json('Unauthorized');
    }
    admin.auth().verifyIdToken(idToken).then(decodedToken=>{
        req.user=decodedToken;
        console.log(decodedToken);
        return db.collection('users').where('userId','==',req.user.uid)
        .limit(1)
        .get();
    }).then((data)=>{
       req.user.handle=data.docs[0].data().handle;
       return next();
    }).catch((err)=>{
        console.log(err);
        return res.status(403).json("unable to handle");
    })
}
exports.postSignUp=(req,res,next)=>{
   
    const newUser={
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        handle:req.body.handle

    }
    
    const isValid  = validateSignUp(newUser);
    if(!isValid.valid) return res.status(403).json(isValid.errors)
   
    let noImg='default.jpeg';
    let token,userId;
     db.doc(`/users/${newUser.handle}`).get()
     .then((doc)=>{
     if(doc.exists)
     {
         return res.status(400).json({ handle:'this handle is already been taken' });
     }
     else{
        return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
     }
    })
    .then((data)=>{
     userId=data.user.uid;
     return data.user.getIdToken();

 }).then((idtoken)=>{
  token=idtoken;
  const userCredentials={
      handle: newUser.handle,
      email:newUser.email,
      createdAt:new Date().toISOString(),
      password:newUser.password,
      imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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

exports.postLogin=(req,res,next)=>{
    const usercred={
        body:req.body.body,
        email:req.body.email,
        password:req.body.password
    }
   const isValid=validateLogin(usercred);
   if(!isValid.valid) return res.status(403).json(isValid.errors)

    firebase.auth().signInWithEmailAndPassword(usercred.email,usercred.password).then((data)=>{
        return data.user.getIdToken();
    }).then((token)=>{
        return res.json({token})
    }).catch(err=>{
        console.log(err);
        return res.status(500).json({error:err.code})
    })
}
exports.uploadImage=(req,res,next)=>{
    const Busboy=require('busboy')
    const path =require('path')
    const os=require('os')
    const fs=require('fs');
    const busboy=new Busboy({header:req.headers})
    let imageFileName;
    let imagetobeUploaded={}
    busboy.on('file',(fieldname,file,filename,encoding,mimetype)=>{
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        const imageExtension=filename.split('.')[filename.split('.').length - 1];
        const imageFileName = `${Math.round(Math.random()*1000000)}.${imageExtension}`;
        const filepath=path.join(os.tmpdir(),imageFileName);
        imagetobeUploaded={filepath,mimetype}
        file.pipe(fs.createWriteStream(filepath));
    })

    busboy.on('finish',()=>{
        admin.storage().bucket().upload(imagetobeUploaded.filepath,{
            resumable:false,
            metadata:{
                metadata:{
                    contentType: imagetobeUploaded.mimetype
                }
            }
        }).then(()=>{
            const imageUrl=`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
            db.doc(`/user/${req.user.handle}`).update({imageUrl})
        }).then(()=>{
            return res.json({message:'Image Uploaded Successfullyyyy!!'})
        }).catch(err=>{
            return res.status(500).json({error:err.code})
        })
    })
    busboy.end(req.rawBody);
}