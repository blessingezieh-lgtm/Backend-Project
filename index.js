
import express from 'express';
import {connectDB} from './database/mongodb.js';


const app = express ();
const PORT =3000

app.listen(PORT,()=>{
  connectDB();
  console.log(`server is running on port 3000 ${PORT} ` )
})