import { Router } from "express";

import {EnrollUser} from "../controller/enroll.controller.js"

const enrollRouter = Router();

enrollRouter.post('/enroll', EnrollUser);



export default enrollRouter;