import mongoose from "mongoose";
import Auth from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {JWT_EXPIRES_IN ,JWT_SECRET } from "../config/env.js";



export const Signup = async (req, res, next) =>{
//        res.send("SIGNUP ROUTE API")
// 
      const session = await mongoose.startSession();
      session.startTransaction();
    
  try{ const {name, email, password, track} = req.body;

    //  check if any of the data is missing 
    if (!name || !email || !password || !track){
       return res.status(400).json({message: "All field are required"});

    }   
    //check if any of the data is missing
      const existingUser  = await Auth.findOne({email}).session(session);
     if(existingUser){
       return res.status(400).json({message:"user already exists"});
     }

     //hashpassword
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password,salt);

      //create new user
 const newUser = await Auth.create([{name, email, password:hashpassword, track}],{session})
//  generate token
 const token = jwt.sign({userId: newUser[0]._id, email: newUser[0]},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN })
 
//commit the transaction to mongoose
 await session.commitTransaction();

  
 return res.status(201).json({message:"User created successful",
      
 })
} catch(error){
    await session.abortTransaction();
    session.endSession()
    return res.status(500).json({message: "something is wrong", error: error.message})
  }
  } 


export const Signin = async (req, res, next) =>{ 
    try{
      const {email,password} = req.body;
      // check if any data is missing
      if(!email || !password){
        return res.status(400).json({message:"All field are required"});
      }
      const User = await Auth.findOne({email});
      if(!User){
        return res.status(400).json({message:"User not found"});
      }


        const isPasswordVaild  = await bcrypt.compare(password, User.password);

        if(!isPasswordVaild){
          return res.status(400).json({message:"Invalid password"});
        }

        const token =jwt.sign({user:User.id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN})

        res.status(200).json({
          success: true,
          message:"Signin successful",
          token: token,
          data: {
            id: User.id,
            name: User.name,
            email: User.email,
            track: User.track
          },


        })
    } catch(error){
      {next(error)

      }
      
    }
  }
