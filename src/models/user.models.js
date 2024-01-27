import bcrypt from "bcrypt";
import mongoose from "mongoose";
import  Jwt  from "jsonwebtoken";
// structure of the data to be stored in database
const userschema= new mongoose.Schema({
    name:{
        required:true,
        type : String,
        trim:true,
        index:true
        
    },
    Email:{
        required:true,
        type : String,
        trim:true,
        index:true,
        unique:true
    },
    age:{
        required:true,
        type : Number,
        trim:true,
        index:true
    },
    gender:{
        required:true,
        type : String,
        lowercase:true,
        trim:true,
        index:true
    },
    weight:{
        required:true,
        type : Number,
        trim:true,
        index:true
    },
    height:{
        required:true,
        type : Number,
        trim:true,
        index:true
    },
    activity_level:{
        required:true,
        type : String
    },
    occoupation:{
        // required:true,
        type : String,
        default: null
    },
    health_history:{
        // required:true,
        type : String,
        default: null
    },
    food_prefrences:{
        // required:true,
        type : String,
        default: "vegetarian"
    },
    password:{
        type : String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String

    }

},{timeseries:true})

userschema.pre("save",async function (next){
    if (!this.isModified("password")) return next() 
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userschema.methods.isPasswordCorrect= async function (password){
    await bcrypt.compare(password,this.password)
} 


userschema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        mail:this.Email,
        name:this.name
        
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