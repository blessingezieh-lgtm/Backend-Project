
import express from 'express';
import {connectDB} from './database/mongodb.js';
import {PORT} from './config/env.js'
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import  dotenv from 'dotenv';


dotenv.config();
const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin:"http://localhost:3000",
  Credential: false,
  method: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["content Type","Authorization"],  
  
}))
app.use(express.urlencoded({extended: true}))


app.use('/api/v1/auth',authRouter);


app.listen(PORT, ()=>{
  connectDB();
  console.log(`server is running on port`);

})


export default app;