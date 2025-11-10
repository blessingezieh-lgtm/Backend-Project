
import express from 'express';
import {connectDB} from './database/mongodb.js';
import {PORT} from './config/env.js'
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import  dotenv from 'dotenv';
import enrollRouter from "./routes/enroll.route.js";
import attendanceRouter from "./routes/enroll.route.js";
import cron from "node-cron";
import { autoMarkabsence } from './controller/enroll.controller.js';  

dotenv.config();
const app = express();
//middleware
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin:"http://localhost:3000",
  Credential: false,
  method: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["content Type","Authorization"],  
  
}))
// to handle urlencoded data
app.use(express.urlencoded({extended: true}))

cron.schedule('* * * * * ' , async () => {
  console.log ("Testing Auto marking function")
  await autoMarkabsence(null, null)
})

//routes middleware
app.use('/api/v1/auth',authRouter);
app.use("/api/v1", enrollRouter);
app.use('/api/attendance', attendanceRouter);


//server
app.listen(PORT, ()=>{
  connectDB();
  console.log(`server is running on port`);

})


export default app;