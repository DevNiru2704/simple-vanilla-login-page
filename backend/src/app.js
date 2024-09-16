import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet"; // You may need to install this: npm install helmet

const app = express();

// CORS configuration
app.use(cors({
    origin: 'https://simple-vanilla-login-page-frontend.onrender.com', // Your frontend URL
    credentials: true
}));

// Set Content Security Policy


app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(cookieParser());



//router declarations

import userRouter from "./routes/user.route.js"

app.get("/test",(req,res)=>{
    res.send("Server is running!")
})

app.use("/api/v1/users",userRouter)


export default app
