import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";
import e from "express";


//Helpers function to get current da
const isWeekend = (date) => {
  const day =  date.getDay()         // Get current date
             // Sunday = 0, Monday = 1, ..., Saturday = 6
  return day === 0 || day === 6;     // Returns true if it's Saturday or Sunday
}


// helpers function to start the day
const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours (0,0,0,0)
  return start
}
//helper function to know end of the day
const getEndOfDay = (date) => {
  const end = new Date(date)
  end.setHours =(23,59,99,999)
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
    current.setDate(current.getDate() + 1)
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
  //  if(today < startOfDay) {
  //   return res.status(400).json({message:"The hasnt started"})
  //  }

  //  if(today > endOfDay) {
  //   res.status(400).json({message:"The day has ended"})
  //  }
   const alreadyMarked = student.attendance.some((record)=>{

         const recordDate = new Date(record.date);
         return recordDate >= startOfDay && recordDate <= endOfDay;
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


  export const getAttendanceByDateRange = async (req, res, next) => {
    try {
  const {start, end} = req.query

  if(!start || !end){
    return res.status(400).json ({
      message:"start date and end date are required"
    })
  }

  const startDate = new Date (start)
  const endDate = new Date (end)
  endDate.setDate(23,59,59,999) 


  if (isNaN(startDate) || isNaN(endDate)){
    return res.status(400).json({
      message: "Not a valid date"
    })
  }
 const students = await Enroll.find({},{
  firstname: 1,
  lastname: 1,
  email: 1,
  gender: 1,
  track: 1,
  attendance: 1,

 })
const findStudents = students.map(student =>{
  const filteredStudents = student.attendance.filter(record =>{
    const recordDate = new Date(record.date);
     return recordDate >= startDate && recordDate <= endDate;
  })

  if(filteredStudents.length > 0){
     return {
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
       gender: student.gender,
       track: student.track,
       attendanceCount: filteredStudents.length,
      };
  }

  return null
}).filter(Boolean)

return res.status(200).json({
  message: "successful",
  attendanceCount: findStudents.length,
  data: findStudents,
})
 } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
  }

export const getOverallAttendance = async (req, res, next) => {
  try {
    const students = await Enroll.find({});
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }
    let totalPresent = 0;
    let totalAbsent = 0;

    const summaries = [];

    students.forEach((student) => {
      const presentDays = student.attendance.filter(
        (b) => b.status === "present"
      ).length;
      const absentDays = student.attendance.filter(
        (b) => b.status === "absent"
      ).length;
      const totalDays = presentDays + absentDays;

      const percentage = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;

      totalPresent += presentDays;
      totalAbsent += absentDays;

      summaries.push({
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
        present :presentDays,
        absent :absentDays,
        percentage,
      });
    });

    const best = summaries.reduce((max, s) =>
      s.percentage > max.percentage ? s : max
    );

    const worst = summaries.reduce((min, s) =>
      s.percentage < min.percentage ? s : min
    );

    const averageAttendance
     =
      summaries.reduce((sum, s) => sum + s.percentage, 0) / summaries.length;

    return res.status(200).json({
      totalPresent,
      totalAbsent,
      averageAttendance,
      bestStudent: best,
      worstStudent: worst,
      allAttendance: summaries,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllStudentsWithAttendance = async (req, res, next) => {
  console.log("fetching all students");

  try {
    const students = await Enroll.find({});

    const result = students.map((student) => {
      const presentDays = student.attendance.filter(
        (a) => a.status === "present"
      ).length;
      const absentDays = student.attendance.filter(
        (a) => a.status === "absent"
      ).length;
      const totalDays = presentDays + absentDays;

      return {
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
        presentDays,
        absentDays,
        percentage: student.getAttendancePercentage(),
      };
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log("error in this route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Enroll.findOne({ _id: id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const totalPresent = student.attendance.filter(
      (b) => b.status === "present"
    ).length; 
    const totalAbsent = student.attendance.filter(
      (b) => b.status === "absent"
    ).length;

    const totalDays = totalPresent + totalAbsent;
    const percentage =
      totalDays === 0 ? 0 : ((totalPresent / totalDays) * 100).toFixed(2);

    return res.status(200).json({
      name: `${student.firstname} ${student.lastname}`,
      email: student.email,
      presentDays: totalPresent,
      absentDays: totalAbsent,
      percentage,
      attendanceHistory: student.attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAttendanceByTrack = async (req, res, next) => {
  try {
    const { track } = req.params; 
    const students = await Enroll.find({ learningtrack: track });

    if (students.length === 0) {  
      return res.status(404).json({ message: "No students found for this track" });
    }
    const result = students.map((student) => {
      const presentDays = student.attendance.filter(
        (a) => a.status === "present" 
      ).length;
      const absentDays = student.attendance.filter(
        (a) => a.status === "absent" 
      ).length;
      const totalDays = presentDays + absentDays;
      return {  
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
        presentDays,
        absentDays,
        percentage: student.getAttendancePercentage(),
      };
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log("error in this route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }   
};

