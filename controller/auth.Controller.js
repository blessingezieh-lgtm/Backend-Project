import mongoose from "mongoose";
import Auth from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {JWT_EXPIRES_IN ,JWT_SECRET } from "../config/env.js";


//signup controller function
export const Signup = async (req, res, next) =>{

// start mongoose session
      const session = await mongoose.startSession();
      session.startTransaction();
    
      // try catch block
  try{ 
    // destructure the req.body
    const {name, email, password, track} = req.body;

    //  validate that all required fields are provided
    if (!name || !email || !password || !track){
       return res.status(400).json({message: "All field are required"});

    }   
    //check if the user already exist in the database
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
 const token = jwt.sign({Id: newUser[0]._id, email: newUser[0].email},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN })
 
//commit the transaction to mongoose
 await session.commitTransaction();

  
 return res.status(201).json({message:"User created successful",
      
 })
} catch(error){
  //roll back the transaction in case of an error 
    await session.abortTransaction();
    //end the session after completing the operation
    session.endSession()
    return res.status(500).json({message: "something is wrong", error: error.message})
  }
  } 

//signin controller function
export const Signin = async (req, res, next) =>{ 
    try{
      //Extract email and password from the req.body
      const {email,password} = req.body;
      // check if any data is missing
      if(!email || !password){
        return res.status(400).json({message:"All field are required"});
      }

      //check if the user exist in the database
      const User = await Auth.findOne({email});
      if(!User){
        return res.status(400).json({message:"User not found"});
      }

// compare the entered password with the hashed password in the database
        const isPasswordVaild  = await bcrypt.compare(password, User.password);

        if(!isPasswordVaild){
          return res.status(400).json({message:"Invalid password"});
        }
// generate a jwt token for authentication
        // const token =jwt.sign({id:User.id, email: User.email},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN})

        // send a success response with user data and token
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
      // forward any error to the error handling middleware
      next(error)

    }
  }
