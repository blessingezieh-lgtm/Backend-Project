import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";


//Helpers function to get current da
const isWeekend = (date) => {
  const day =  date.getDay()         // Get current date
             // Sunday = 0, Monday = 1, ..., Saturday = 6
  return day === 0 || day === 6;     // Returns true if it's Saturday or Sunday
}


// helpers function to start the day
const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours =(0,0,0,0)
  return start
}
//helper function to know end of the day
const getEndOfDay = (date) => {
  const end = new Date(date)
  end.setHours =(13,59,99,999)
  return end
}


// helper function to get working days range(Mon - Fri)
const getWoringDays =(startDate, EndDate) =>{
  const workingDays = []
  const current =new Date(startDate)
  while(current <= EndDate){
    if (!isWeekend(current)){
      workingDays.push(new Date(current))
    }
    current,setDate(current.getDate() + 1)
  }
  return workingDays;
}
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


export const markAttendance = async (req,res,next)=>{
  try {
    const {email} = req.body;

    if(!email){
      return res.status(400).json({message:"email is required!"})
    }
    //Validation - check if student enrolled
   const student  = await Enroll.findOne({email});
   if(!student){
    return res.status(404).json({message: "student not found!please enroll first."})
   }

   const today = new Date()
   console.log ("Today is Date:",today)

   // check if today is weekend
   if(isWeekend(today))
    return res.status (400).json({message: "Attendance can not be marked on weekends"})


// prevent student from marking attendance twice in a day
//this means startOfDay is 00.00 midnight
//this means endOfDay is 11.59pm today
//so we are creating a time range that represents today only

   const startOfDay = getStartOfDay(today)
   const endOfDay = getEndOfDay(today)
   const alreadyMarked = student.attendance.some((record)=>{

         const recordDate = new Date(record.date);
         return recordDate >= startOfDay &&recordDate <=endOfDay;
   })

   if (alreadyMarked){
    return res.status(400).json({message:"Attendance already marked"})
   }

    //Mark the student present
    student.attendance.push({
      date: today,
      status: "present"
    })

    //save it
    await student.save();

    return res.status(200).json({
      message: "Attendance marked successfully!",
    })

   
  }catch (error) {
    return res.status(500).json({
      message: "Something went wrong", 
      error: error.message
    })
  }
}



export const autoMarkabsence = async (req,res,next)=>{
    try {
        // THis helpd to get to get 
        const today = new Date()

        // Don't run if it's a weekend
        if (isWeekend(today)) {
            const message = "Weekend - No auto-marking needed"
            console.log(message);
            
            if (res) {
               return res.status(200).json({message})
            }
            return;
        }
        
        // This two logics helps to check if the current is between 9am - 1:59pm
        const Daybegins = getStartOfDay(today)
        const DayEnds = getEndOfDay(today)

        // This will return all the list of the student in the database
        const students = await Enroll.find({})

        // 
        let MarkedCount = 0;

        for(const student of students){
            const markToday = student.attendance.some((record)=>{
                // Get the date from the record 
                const recordDate = new Date(record.date)
                
            })

                // If ths attendance is not marked! today
        if (!markToday) {
            student.attendance.push({
                date: today,
                status: "absent"
            });

            await student.save();
            MarkedCount++
            console.log(`Auto Marked ${student.email} as absent today ${today.toDateString()}`);
            
        }
        };
        const message = `Auto-marking completed. Total number of students marked absent today is ${MarkedCount}`;
        console.log(message);

    } catch (error) {
        console.error(`Error in auto marking: ${error.message}`);
        
    }
}

export const getOverallAttendance = async (req,res,next)=>{

}











