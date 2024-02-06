
import dotenv from "dotenv";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
dotenv.config({
    path:"./.env"
})

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGN
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public "))

//routes import
import userrouter from "./routes/user.routes.js";


// routes declaration

app.use("/api/v1/users",userrouter)



export {app}