import mongoose from "mongoose";


const enrollSchema = new mongoose.Schema({
   firstname:{
          type: String,
          required:true,
          trim: true, 
          minLength :[4,"name must be at least 4 character"],
         
      },
        lastname:{
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
  
      phonenumber :{
          type: Number,
          required:true,
          unique: true,
          trim: true,
          minLength :[11,"Password must be at least 5 character"],
          match:[/^\+?[1-9]\d{1,14}$/,"phone number is invalid"],
      },

    
      gender:{
          type: String,
          enum:[
              "male",
             "female", 
      ],
         required: [true,"gender is required"],
      },

   
       learningtrack:{
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
 {timestamps: true,}


  );
  
  
  const Enroll = mongoose.model("Enroll", enrollSchema)
  export default Enroll;