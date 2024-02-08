import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs";


cloudinary.config({ 
    cloud_name: process.env.Cloudinary_Cloud_Name, 
    api_key: process.env.Cloudinary_API_Key, 
    api_secret: process.env.Cloudinary_API_Secret,
    secure: true
  });


  const uploadoncloudinary = async (localfilepath)=>{
    try{
        if(!localfilepath) return null
        const response =await cloudinary.uploader.upload(localfilepath,
           { resourse_type:"auto"})

        // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localfilepath) 
        return response;
    }
    catch(error){
        fs.unlinkSync(localfilepath)  //remove the locally saved file when the operation is got failed 
    }
  }


export {uploadoncloudinary}