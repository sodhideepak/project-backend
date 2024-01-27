// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
dotenv.config({
    path:"./.env"
})
mongoose.set("strictQuery", false);
const  connectdb = async()=>{
    try{
        const connectioninstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`mongodb connected :dbhost:${connectioninstance.connection.host} `); 

       
    } 
    catch(error){ 
        console.log("mongodb connection error",error);
        process.exit(1)
    }

}

export default connectdb