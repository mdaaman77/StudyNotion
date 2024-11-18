const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("email-validator");
require("dotenv").config();

exports.auth= async (req,res,next)=>{
try{

         //fetch token from req
   //const token = req.header("Authorization").replace("Bearer ", "") || req.cookies.token || req.body.token;
         //const token = (req.header("Authorization") && req.header("Authorization").replace("Bearer ", "")) || req.cookies.token || req.body.token;
         const token = req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer ", "");
        
         
        // 
         console.log("token ",token);

         //verify token
        if(!token){
            return res.status(401).json({error:"Please authenticate using a valid token"});
        }
        //verify jwt token 
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log("decoded token here ",decode);
            //store decode token payload in req for further use to check isStudent/Admin/Instsructor
            req.user= decode;

        }catch(e){

            // If JWT verification fails, return 401 Unauthorized response
			return res
            .status(401)
            .json({ success: false,
                 message: "token is invalid" });
        }
          

    next();
}catch(e){
    console.log(e);
// If there is an error during the authentication process, return 401 Unauthorized response
return res.status(401).json({
    success: false,
    message: `Something Went Wrong While Validating the Token`,
});

}
}


//middleware for checking Student

exports.isStudent = async (req,res,next)=>{
    try{
         //fetch data from req
         const user = req.user;
         
         //check the role contain is student in token payload
         if(user.role != "Student"){
            return res.status(403).json({
                success:false,
                message:"This is a Protected Route for Students"});
         }

         
next();


    }catch(e){
        console.error(e);
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
            
    }
    
}


//middleware for checking Instructor


exports.isInstructor = async (req,res,next)=>{
    try{

         //fetch data from req
         const user = req.user;
         
         //check the role contain is student in token payload
         if(user.role != "Instructor"){
            return res.status(403).json({
                success:false,
                message:"This is a Protected Route for Instructor"});
         }

         
next();


    }catch(e){
        console.error(e);
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
           
    }
    
}


//middleware for checking Admin


exports.isAdmin = async (req,res,next)=>{
    try{
         //fetch data from req
         const user = req.user;
         
         //check the role contain is student in token payload
         if(user.role != "Admin"){
            return res.status(403).json({
                success:false,
                message:"This is a Protected Route for Admin"});
         }

         
next();

    }catch(e){
        console.error(e);
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
           
    }
}