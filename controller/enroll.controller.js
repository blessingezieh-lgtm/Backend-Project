import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";


export const EnrollUser = async (req, res, next) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    try{

        const {firstname, lastname, email, phonenumber,  gender, learningtrack} = req.body;

        // validate that all required fields are provided
        if (!firstname || !lastname || !email || !phonenumber || !gender || !learningtrack)
           return res.status(400).json({message: "All field are required"}); 

        //check if the user already exist in the database
        const existingUser  = await Enroll.findOne({email}).session(session); 
    if (existingUser) {
      return res.status(400).json({ message: "Email, phone number, already exists" });
    }

    // Create new enrollment
    const newEnrollment = await Enroll.create([{
      firstname,
      lastname,
      email,
      phonenumber,
      gender,
      learningtrack,
    }], {session});

        await session.commitTransaction();
        session.endSession()

    return res.status(201).json({
      message: "Enrollment successful",
      
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession()
   next(error);
  }
};




