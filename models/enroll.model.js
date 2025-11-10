import { parse } from "dotenv";
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    status: {   
        type: String,
        enum: ["present", "absent"],
       required: true,
    },

    },

   {
    _id: false
   }
)

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
          minlength :[11,"Password must be at least 5 character"],
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
           "Cyber Security",
           "Data Analytics"
    ],
       required: [true,"Tracks is required"],
    },

    attendance: {
    type: [attendanceSchema],
    default: [],
  },
},

 {timestamps: true,}


  );
  
//help to search faster using index
enrollSchema.index({ email: 1 });
enrollSchema.index({"attendance.date": 1 });

// combines firtsName and lastName together to search faster using fullname
enrollSchema.virtual("fullname").get (function(){
    return `${this .firstname}${lastname}`
})
  
enrollSchema.methods.getAttendancePercentage = function(){
    //step 1: check if student has any attendance record!
    if (this.attendance.length === 0) return 0;

    // step 2: count how many times they were present
    const presentCount = this.attendance.filter(record => record.status === "present").length;

    // step 3: calculate percentage
    // formula: (number of presents/ total number of attendance records) * 100
    retrun ((presentCount / this.attendance.length) * 100).toFixed (2);
     
}    


//method to get attendance by date range
enrollSchema.methods.getAttendanceByDateRange = function(startDate, endDate){
    return this.attendance.filter((record)=>{
       const recordDate = new Date(record.date);
       return recordDate >= startDate && recordDate <= endDate;
});

};

enrollSchema.statics.findLowAttendanceStudents = async function(threshold = 75){
    //step 1: get all students from databas
    const students = await this.find();

    // step 2: filter students with attendance below threshold
    return students.filter((student )=>{
        const percentage =  student.getAttendancePercentage();
       return parseFloat(percentage) < threshold;
    });
}


   const Enroll = mongoose.model("Enroll", enrollSchema)
  export default Enroll;