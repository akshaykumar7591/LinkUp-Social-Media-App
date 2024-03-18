const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
// const {SENDGRID_API,EMAIL} = require('../config/keys')
//


// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth:{
//         api_key:SENDGRID_API
//     }
// }))

router.post('/signup',(req,res)=>{
    // console.log("hello deer");
    const {name,email,password}=req.body; // i am using ES6 here mean variable in decalre only one time
    if(!name || !email || !password){
        return res.status(422).json({error:"please add all the fields"});
    }else res.status(402);
    User.findOne({email:email}) // findOne return objext of user if exist
    .then((saveUser)=>{

        // console.log(saveUser)
        if(saveUser){
            return res.status(422).json({error:"user already exists with that email"})
        }
         bcrypt.hash(password,10)
         .then((hashPassword)=>{
                const user=new User({
                    name:req.body.name,
                    email,    // not required here because in usinng email variable and req.body.email same
                    password:hashPassword
                })
        
                user.save()
                .then(()=>{
                    res.status(200).json({message:"saved successfully"})
        
                })
                .catch(()=>{
                    res.status(201).json({message:"not saved successfully"})
                })
         })
        

    })
    .catch(()=>{
        console.log("error in find one singup")

    })

})



router.post('/signin',async(req,res)=>{
    try{ 
        console.log("err")
     const {email,password}=req.body; // i am using ES6 here mean variable in decalre only one time
     if(!email || !password){
         return res.status(422).json({error:"please add all the fields"});
     }
       const isUserExist=await User.findOne({email:email});
       if(!isUserExist){
         return res.status(422).json({error:"Invalid Email or password"})
 
       }
       const isMatch=await bcrypt.compare(password,isUserExist.password);
       if(isMatch){
         const token=await jwt.sign({_id:isUserExist._id},"akshyKumarishello");
         const {id,name,email,followers,following,pic} = isUserExist
         console.log(isUserExist)
                res.json({token,user:{id,name,email,followers,following,pic}})
       }
       else{
         return res.status(422).json({error:"Invalid Email or password"})
       }
 
 
    }
    catch(err){
     console.log(err)
 
    }
 })


// router.post('/reset-password',(req,res)=>{
//      crypto.randomBytes(32,(err,buffer)=>{
//          if(err){
//              console.log(err)
//          }
//          const token = buffer.toString("hex")
//          User.findOne({email:req.body.email})
//          .then(user=>{
//              if(!user){
//                  return res.status(422).json({error:"User dont exists with that email"})
//              }
//              user.resetToken = token
//              user.expireToken = Date.now() + 3600000
//              user.save().then((result)=>{
//                  transporter.sendMail({
//                      to:user.email,
//                      from:"no-replay@insta.com",
//                      subject:"password reset",
//                      html:`
//                      <p>You requested for password reset</p>
//                      <h5>click in this <a href=http://localhost:3000/reset/${token}">link</a> to reset password</h5>
//                      `
//                  })
//                  res.json({message:"check your email"})
//              })

//          })
//      })
// })


// router.post('/new-password',(req,res)=>{
//     const newPassword = req.body.password
//     const sentToken = req.body.token
//     User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
//     .then(user=>{
//         if(!user){
//             return res.status(422).json({error:"Try again session expired"})
//         }
//         bcrypt.hash(newPassword,12).then(hashedpassword=>{
//            user.password = hashedpassword
//            user.resetToken = undefined
//            user.expireToken = undefined
//            user.save().then((saveduser)=>{
//                res.json({message:"password updated success"})
//            })
//         })
//     }).catch(err=>{
//         console.log(err)
//     })
// })


module.exports = router