import { Router } from "express";
import {
  autoMarkabsence,
  EnrollUser,
  markAttendance,
  getStudentAttendance,
  getAllStudentsWithAttendance,
  getOverallAttendance,
  getAttendanceByDateRange,
  getAttendanceByTrack,
} from "../controller/enroll.controller.js";
import { get } from "mongoose";

const enrollRouter = Router();

enrollRouter.get("/test", (req, res) => {
  console.log("Test route hit!");
  res.send("Route works");
});

enrollRouter.post("/enroll", EnrollUser);
enrollRouter.post("/mark", markAttendance);
enrollRouter.post("/absent", autoMarkabsence);
enrollRouter.get("/att/all", getAllStudentsWithAttendance);
enrollRouter.get("/att/overall", getOverallAttendance);
enrollRouter.get("/att/filter", getAttendanceByDateRange);
enrollRouter.get("/att/:track",getAttendanceByTrack);
// This is for a student’s personal attendance i.e a particular student
enrollRouter.get("/att/:id", getStudentAttendance);


export default enrollRouter;