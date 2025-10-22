import mongoose from "mongoose";

// The async function to connect to the database
export const connectDB = async () => {
     try{
          await mongoose.connect('mongodb+srv://backendproject25:backend_25@clurd.hay9d2w.mongodb.net/')
          console.log("mongosedb connected successfully")
     }catch(error){
     console.error(" Error in Mongodb connection ", error)
    }

}