const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=mongoose.model("User");
const bcrypt=require('bcryptjs')//for hiding password using 
const jwt=require('jsonwebtoken')
const{JWT_SECRET}=require('../config/key')
const requirelogin=require('../middleware/requireLogin')

// router.get('/protected',requirelogin,(req,res)=>{
//     res.send('hello')
// })
router.post('/signup',(req,res)=>{
   const{name,email,password,pic}=req.body
   if(!name || !email ||!password)
   {
      return res.status(422).json({error:"plz add all feilds"})
   }
   
  
   User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser)
        {
            return res.status(422).json({error:"user already exists with the following emsil"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user=new User({
                email,
                password:hashedpassword,
                name,
                pic
            })
            user.save()
            .then(user=> {res.json({message:"suceessfully posted"})
        
             })
             .catch(err=>{
                console.log(err)
             })  
        })
        
    })
    .catch(err=>{
        console.log(err)
     })  
})
router.post('/signin',(req,res)=>{
    const{email,password}=req.body
    if( !email ||!password)
    {
       return res.status(422).json({error:"plz add email or password"})
    }
    User.findOne({email:email})
     .then((savedUser)=>{
         if(!savedUser)
         {
             return res.status(422).json({error:"Invalid email or password"})
         }
         bcrypt.compare(password,savedUser.password)
         .then(domatch=>{
            if(domatch)
            {
                //res.json({message:"suceessfully signed in"})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
                const{_id,name,email,followers,following,pic}=savedUser
                res.json({token,user:{_id,name,email,followers,following,pic}})
            }
            else{
                return res.status(422).json({error:"Invalid email or password"})
            }
         })
         .catch(err=>{
            console.log(err)
         })  
         
     })
})

module.exports=router;