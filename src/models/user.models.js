import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
// structure of the data to be stored in database
const userschema= new mongoose.Schema({
    username:{
        type : String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
        
    },
    email:{
        type: String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type : String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        required:true,
        type : String, //cloudinary url
        
    },
    coverimage:{
        type : String,
       
    },
    watchhistory:{
        type: Schema.Types.ObjectId,
        ref:"video"
    },
    password:{
        type : String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String

    }

},{timestamps:true})

userschema.pre("save",async function (next){
    if (!this.isModified("password")) return next() 
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userschema.methods.isPasswordcorrect= async function(password){
    return await bcrypt.compare(password,this.password)
} 


userschema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        email:this.Email,
        username:this.username,
        fullname:this.fullname
        
    },
    process.env.Access_Token_Secret,
    {
        expiresIn : process.env.Access_Token_Expiry
    })
}



userschema.methods.generateRefreshToken=function(){
    return Jwt.sign({
        _id:this._id,
        
    },
    process.env.Refresh_Token_Secret,
    {
        expiresIn : process.env.Refresh_Token_Expiry
    })
}


export const user = mongoose.model("user", userschema)     