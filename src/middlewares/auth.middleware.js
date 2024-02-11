import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import  Jwt  from "jsonwebtoken";
import { user } from "../models/user.models.js";


const verifyJWT= asynchandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accesstoken ||  req.header("Authorization")?.replace("Bearer ","")
    
        if (!token) {
            throw new ApiError(401,"unauthorized request")
            
        }
    
        const decodedtoken= Jwt.verify(token,process.env.Access_Token_Secret)
    
        const User = await user.findById(decodedtoken?._id).select("-password -refreshtoken")
    
        if (!User) {
            throw new ApiError(401,"invalid access token")
            
        }
    
        req.user =User;
        next()
    
    } catch (error) {
        throw new ApiError(401,error?.message || "inavalid access token")
    }
})


export {verifyJWT}