import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

// The async function to connect to the database
export const connectDB = async () => {

     try{
          await mongoose.connect( DB_URI )
          console.log("mongosedb connected successfully")
     }catch(error){
     console.error(" Error in Mongodb connection ", error)
    }

}