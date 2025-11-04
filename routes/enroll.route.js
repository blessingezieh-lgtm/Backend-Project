import { Router } from "express";
import express from "express";
import { EnrollUser } from "../controller/enroll.controller.js";

const enrollRouter = Router();

enrollRouter.post('/enroll', EnrollUser);

// const router = express.Router();



export default enrollRouter;