import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({
    path:"./.env"
})

const port=process.env.PORT||3000

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server is running successfully at https://simple-vanilla-login-page-backend.onrender.com`)
    })
})
.catch((err)=>{
    console.error("MongoDB Connection Failed!!\nError:\n",err)
})
