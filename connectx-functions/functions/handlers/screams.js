const {db}=require('../util/admin')



exports.getAllscreams=(req,res,next)=>{
    db.collection('requests')
    .orderBy('createdAt','desc')
    .get()
    .then((data)=>{
     let requests=[];
   
     data.forEach((doc)=>{
         requests.push({
        requestId:doc.id,
        body:doc.data().body, 
       userHandle:doc.data().userHandle,
        createdAt:doc.data().createdAt
     });
         
     })
     return res.json(requests);
  }).catch((err)=>{
      console.log(err)
     res.status(500).json({error:err.code})
  })
}
exports.postScreams=(req,res,next)=>
{  
  const newScream={
      body:req.body.body,
      userHandle:req.user.handle,
      createdAt: new Date().toISOString()
  }
  db
  .collection('requests') 
  .add(newScream)
  .then((doc)=>{
    return res.json({message :`document ${doc.id} created successfully`})
  })
  .catch((err)=>{
    console.log(err); 
    return res.status(500).json({error:'something went wrong'});
      
  })
}