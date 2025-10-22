# 1. Install express - npm install express
# 2. Install nodemon - npm install nodemon -D
# 3. Install dotenv - npm install dotenv 
# 4. Install cors - npm install cors
# 5. Install cookie-parser - npm install cookie-parser
# 6. Install Mongoose - npm install mongoose
# 7. Jweb token and bcrypt - npm install jsonwebtoken bcryptjs


# Project setup
# folder structure
# Model

# Signup Model (Name, Email, Password, Confirm Password, Tracks)
Steps: Connect to Mongodb
import express from 'express';
import {connectDB} from './database/mongodb.js'
import mongoose from 'mongoose';


const app = express();
const PORT = 3000;

app.listen(PORT,()=>{
  connectDB();
  console.log (`server is running on port 3000 ${PORT}`)
})

