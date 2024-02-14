import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.models.js";
// import bcrypt from "bcrypt";
// import mongoose from "mongoose";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens=async(userid)=>{
    try {
        const User = await user.findById(userid)
        console.log(User);
        const accesstoken = User.generateAccessToken()
        const refreshtoken = User.generateRefreshToken()
        // console.log(refreshtoken);
        User.refreshToken=refreshtoken
        // console.log("1 :",User.refreshtoken);
        // console.log("2 :",refreshtoken);
        await User.save({ validateBeforeSave: false })


        return{accesstoken,refreshtoken}
    
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
}

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


    let coverimageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) || req.files.coverimage.length > 0) {
        coverimageLocalPath = req.files.coverimage[0].path
    }
    //  console.log("1",Array.isArray(req.files.coverimage));
    //  console.log("2",req.files);
    //  console.log("3",req.files.coverimage.Lenght > 0);
    // console.log("coverimage :",coverimageLocalPath);
    // console.log(avatarlocalpath);
    if (!avatarlocalpath) {
        throw new ApiError(400,"avatar is required")
    }
    
    const avatar =await uploadoncloudinary(avatarlocalpath);
    const coverimage =await uploadoncloudinary(coverimageLocalPath);

    if (!avatar) {
        throw new ApiError(400,"avatar file is required")
    }

    const User=await user.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

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


const loginuser = asynchandler(async (req,res)=>{

    // req body get data
    // check username / email
    // find the user 
    // check password
    // generate refresh and acess tokens
    // send cookie

    const {email,username,password}= req.body
    console.log("email =",email);
    
    console.log(email,username,password);
    if (!email && !username) {
        throw new ApiError(400,"username or email is required")     
    }

    const User = await user.findOne({
        $or:[ {username},{email}]
    })

    if (!User) {
        throw new ApiError(400, "user does not exist")
        
    }
    // console.log(User._id);
    

    
    const ispasswordvalid= await User.isPasswordcorrect(password)
    // console.log(ispasswordvalid);
    if (!ispasswordvalid) {

        throw new ApiError(400,"invlid user credientials")
        
    } 

    const {accesstoken,refreshtoken} = await generateAccessAndRefreshTokens(User._id)

    const loggedinuser =await user.findById( User._id).select("-password -refreshToken");
    // console.log(loggedinuser);    

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedinuser,accesstoken,refreshtoken
            },
            "user logged in sucessfully")
    )

})
// const User = await user.findById(req.user._id)
// await User.save({ validateBeforeSave: false })


const logout =asynchandler(async(req,res)=>{
    await user.findByIdAndUpdate(
        req.user._id,{
            $unset: {
                refreshToken: 1 // this removes the field from document
            },
           
        },
        {
            new:true
        }
    )
    
    console.log(req.user._id?.refreshToken);
    

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "user logged out sucessfully")
    )


})



const refreshAccessToken = asynchandler(async(req,res)=>{
    // console.log("req.body : ",req.body);

    // const incomingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken
    const incomingrefreshtoken = req.body.refreshToken || req.cookies.refreshToken
    
    if(!incomingrefreshtoken){
        throw new ApiError(401,"unauthorized request")
    }
    
    try {
        const decodedtoken = jwt.verify(
            incomingrefreshtoken,
            process.env.Refresh_Token_Secret
        )
    
        // console.log("decodedtoken : ",decodedtoken);
        // console.log("decodedtoken id : ",decodedtoken?._id);
        const User = await user.findById(decodedtoken?._id)
        
        // console.log(User);
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
        
        // console.log("incomminrefreshtoken : ",incomingrefreshtoken);
        console.log("User?.refreshToken : ",User?.refreshToken);

        if(incomingrefreshtoken !== User?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {accesstoken,refreshtoken}=await generateAccessAndRefreshTokens(decodedtoken?._id)

        // console.log("newrefreshtoken : ",refreshtoken);
        // console.log("accesstoken : ",accesstoken);
    
        return res.status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refreshtoken",refreshtoken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accesstoken, refreshtoken:refreshtoken
                },
                "access token refreshed sucessfully"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})


export {
        registeruser,
        loginuser,
        logout,
        refreshAccessToken}