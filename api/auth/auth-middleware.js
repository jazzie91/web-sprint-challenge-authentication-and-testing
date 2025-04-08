const User = require('../users/users-model')
 
 
 async function checkUsernameFree (req,res,next) {
     console.log('here middleware')
     try{
       const users = await User.findBy(req.body.username)
       console.log('req username', req.body.username)
       console.log(users,"users")
       if(users){
         res.status(500).json({message:'username taken'})
        // next({status:422, message:"username taken"})
       }else{
        next()
       }
     }catch (err){
       next(err)
     }
       
     }
 
     const checkUsernameExists = async(req,res,next)=>{
         console.log('here')
 
         try{
             const user = await User.findBy(req.body.username)
             console.log('user',user)
             if(!user){
                 res.status(401).json({message:"invalid credentials"})
             }else{
                 req.user = user
                 next()
             }
                 
         }catch(err){
             next(err)
         }
     }
 
 
 
 
 
     module.exports = {
         checkUsernameFree,
         checkUsernameExists
       }