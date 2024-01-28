import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoschema= new Schema(
    {
    videofile:{
        type:String, //cloudinary url
        required:true
    },
     thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:number,
        required:true
    },
    views:{
        type:number,
        default:0
    },
    ispublished:{
        type:boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }





    
    },{timestamps:true})



videoschema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("video",videoschema)
