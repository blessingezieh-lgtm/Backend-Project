import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";
import express from "express";


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

// Controller to fetch attendance for all students within a specified date range
export const getAttendanceByDateRange = async (req, res, next) => {
  try {
    // Extract 'start' and 'end' dates from query parameters
    const { start, end } = req.query;

    // Validate that both start and end dates are provided
    if (!start || !end) {
      return res.status(400).json({
        message: "start date and end date are required",
      });
    }

    // Convert the query parameters to Date objects
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Set end time to the end of the day (23:59:59.999)
    endDate.setHours(23, 59, 59, 999);

    // Check if the dates are valid
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        message: "Not a valid date",
      });
    }

    // Fetch all students with selected fields
    const students = await Enroll.find({}, {
      firstname: 1,
      lastname: 1,
      email: 1,
      gender: 1,
      track: 1,
      attendance: 1, // include attendance array
    });

    // Filter students' attendance records to only include those in the date range
    const findStudents = students.map(student => {
      const filteredStudents = student.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      // Only return students who have attendance in the given date range
      if (filteredStudents.length > 0) {
        return {
          name: `${student.firstname} ${student.lastname}`, // full name
          email: student.email,
          gender: student.gender,
          track: student.track,
          attendanceCount: filteredStudents.length, // number of attendance records in range
        };
      }

      // If no attendance records in range, return null
      return null;
    })
    // Remove null entries (students without attendance in range)
    .filter(Boolean);

    // Send success response with filtered students
    return res.status(200).json({
      message: "successful",
      attendanceCount: findStudents.length, // total students with attendance in range
      data: findStudents,                    // array of student attendance summaries
    });

  } catch (error) {
    // Handle unexpected server errors
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Controller to calculate overall attendance for all students
export const getOverallAttendance = async (req, res, next) => {
  try {
    // Fetch all students from the database
    const students = await Enroll.find({});

    // If no student is found, return an error response
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    // Variables to hold total number of present and absent days for all students
    let totalPresent = 0;
    let totalAbsent = 0;

    // Array to hold each student's attendance summary
    const summaries = [];

    // Loop through each student to calculate their attendance
    students.forEach((student) => {

      // Count number of present days
      const presentDays = student.attendance.filter(
        (b) => b.status === "present"
      ).length;

      // Count number of absent days
      const absentDays = student.attendance.filter(
        (b) => b.status === "absent"
      ).length;

      // Total days recorded for the student
      const totalDays = presentDays + absentDays;

      // Calculate attendance percentage and avoid division by zero
      const percentage = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;

      // Add student's present and absent days to the overall totals
      totalPresent += presentDays;
      totalAbsent += absentDays;

      // Push this student's attendance summary into the array
      summaries.push({
        name: `${student.firstname} ${student.lastname}`, // full name
        email: student.email,
        present: presentDays,
        absent: absentDays,
        percentage, // attendance percentage
      });
    });

    // Find the student with the highest attendance percentage
    const best = summaries.reduce((max, s) =>
      s.percentage > max.percentage ? s : max
    );

    // Find the student with the lowest attendance percentage
    const worst = summaries.reduce((min, s) =>
      s.percentage < min.percentage ? s : min
    );

    // Calculate average attendance for all students
    const averageAttendance =
      summaries.reduce((sum, s) => sum + s.percentage, 0) / summaries.length;

    // Send final response containing overall and individual attendance data
    return res.status(200).json({
      totalPresent,         // total present days across all students
      totalAbsent,          // total absent days across all students
      averageAttendance,    // average attendance % for all students
      bestStudent: best,    // student with best attendance
      worstStudent: worst,  // student with worst attendance
      allAttendance: summaries, // list of summaries for all students
    });
  } catch (error) {
    // Handle any unexpected server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to fetch all students and their attendance summary
export const getAllStudentsWithAttendance = async (req, res, next) => {
  // Log that the route was hit (for debugging)
  console.log("fetching all students");

  try {
    // Fetch all students from the database
    const students = await Enroll.find({});

    // Map over each student to create a summary object
    const result = students.map((student) => {

      // Count the number of present days for this student
      const presentDays = student.attendance.filter(
        (a) => a.status === "present"
      ).length;

      // Count the number of absent days for this student
      const absentDays = student.attendance.filter(
        (a) => a.status === "absent"
      ).length;

      // Calculate total recorded days (present + absent)
      const totalDays = presentDays + absentDays;

      // Return a summary object for each student
      return {
        name: `${student.firstname} ${student.lastname}`, // full name
        email: student.email,                             // email
        presentDays,                                      // total present days
        absentDays,                                       // total absent days
        percentage: student.getAttendancePercentage(),   // percentage calculated from model method
      };
    });

    // Send the result array as JSON response
    return res.status(200).json(result);

  } catch (error) {
    // Log the error and return server error response
    console.log("error in this route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Controller to fetch the attendance of a single student by their ID
export const getStudentAttendance = async (req, res, next) => {
  try {
    // Extract the student's ID from the URL parameters
    const { id } = req.params;

    // Find the student in the database by their ID
    const student = await Enroll.findOne({ _id: id });

    // If no student is found, return a 404 error
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Count the number of present days for this student
    const totalPresent = student.attendance.filter(
      (b) => b.status === "present"
    ).length;

    // Count the number of absent days for this student
    const totalAbsent = student.attendance.filter(
      (b) => b.status === "absent"
    ).length;

    // Calculate total days (present + absent)
    const totalDays = totalPresent + totalAbsent;

    // Calculate attendance percentage and avoid division by zero
    const percentage =
      totalDays === 0 ? 0 : ((totalPresent / totalDays) * 100).toFixed(2);

    // Send the response with student details and attendance summary
    return res.status(200).json({
      name: `${student.firstname} ${student.lastname}`, // full name
      email: student.email,                             // email
      presentDays: totalPresent,                        // total present days
      absentDays: totalAbsent,                          // total absent days
      percentage,                                       // attendance percentage
      attendanceHistory: student.attendance,           // full attendance record
    });

  } catch (error) {
    // Handle any unexpected server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to fetch attendance of all students in a specific track
export const getAttendanceByTrack = async (req, res, next) => {
  try {
    // Extract the track name from the URL parameters
    const { track } = req.params;

    // Fetch all students whose 'learningtrack' matches the given track
    const students = await Enroll.find({ learningtrack: track });

    // If no students are found for this track, return a 404 error
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this track" });
    }

    // Map over each student to create an attendance summary
    const result = students.map((student) => {

      // Count the number of present days for the student
      const presentDays = student.attendance.filter(
        (a) => a.status === "present"
      ).length;

      // Count the number of absent days for the student
      const absentDays = student.attendance.filter(
        (a) => a.status === "absent"
      ).length;

      // Calculate total attendance days
      const totalDays = presentDays + absentDays;

      // Return a summary object for each student
      return {
        name: `${student.firstname} ${student.lastname}`, // full name
        email: student.email,                             // email
        presentDays,                                      // total present days
        absentDays,                                       // total absent days
        percentage: student.getAttendancePercentage(),   // attendance percentage using model method
      };
    });

    // Send the attendance summary as a JSON response
    return res.status(200).json(result);

  } catch (error) {
    // Log the error and return a server error response
    console.log("error in this route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



