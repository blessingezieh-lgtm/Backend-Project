import mongoose from "mongoose";


const authSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true, 
        minLength :[4,"name must be at least 4 character"],
       
    },
    email:{
        type: String,
        required:true,
        unique: true,
        trim: true,
        lowercase:true, 
        minLength :[10,"Email must be at least 10character"],
        
        match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },

    password :{
        type: String,
        required:true,
        minLength :[5,"Password must be at least 5 character"],
      
    },
    
    track:{
        type: String,
        enum:[
            "Backend Development",
           "Fullstack Development",
           "Cloud Computing",
           "Cybersecurity",
           "Data Analytics"
    ],
       required: [true,"Tracks is required"],
    },
},
   {Timestamps: true,}

   

);


const auth = mongoose.model("Auth",authSchema)
export default auth;