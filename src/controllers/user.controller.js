import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.models.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registeruser = asynchandler(async (req,res)=>{
    // get user details
    // validate the data
    // check if user already exist
    // check for images/avatar
    // upload to cloudinary
    // create user object in db
    // remove refresh token field for input
    // check for user creation
    // return res
    const {fullname,email,username, password}= req.body
    console.log("email =",email);
    

    if([fullname,email,username,password].some((field)=> field?.trim()==="")) {
        throw new ApiError(400,"all fields are required")
    }
    const existeduser = await user.findOne(
        {
            $or:[{username},{email}]
        }
    )

    if (existeduser) {
        throw new ApiError(409,"user already registered")
    }

    const avatarlocalpath =req.files?.avatar[0]?.path;
    // const coverimagelocalpath =req.files?.coverimage[0]?.path;

    let coverimagelocalpath;

    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.lenght > 0) {
        coverimagelocalpath = req.files.coverimage[0].path   
    }
     
    // console.log(avatarlocalpath);
    if (!avatarlocalpath) {
        throw new ApiError(400,"avatar is required")
    }
    
    const avatar =await uploadoncloudinary(avatarlocalpath);
    const coverimage =await uploadoncloudinary(coverimagelocalpath);

    if (!avatar) {
        throw new ApiError(400,"avatar file is required")
    }

    const User=await user.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // console.log( user.findById(await user._id).select("-password -refreshToken"));
    const createduser =await user.findById( User._id).select("-password -refreshToken");    

    if (!createduser) {
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createduser,"user registered sucessfully")
    )

})





export {registeruser}