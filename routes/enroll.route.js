import { Router } from "express";
import express from "express";
import {EnrollUser,markAttendance} from "../controller/enroll.controller.js";
// import { markAttendance} from "../controller/enroll.controller.js";
const enrollRouter = Router();

enrollRouter.post('/enroll', EnrollUser);

enrollRouter.post('/attendance', markAttendance);

const attendanceRouter = express.Router();

attendanceRouter.post('/attendance', markAttendance);



export default enrollRouter;