import {Router} from "express";
import {Signup, Signin,adminonly } from "../controller/auth.Controller.js";

const authRouter = Router();


authRouter.post("/signup",Signup)

authRouter.post("/signin",Signin);
authRouter.get("/admin", adminonly);

export default authRouter;