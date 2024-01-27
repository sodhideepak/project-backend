// const asynchandler = (fn)=> async (req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             status:"failed",
//             message:err.message
//         })
//     }
// }

const asynchandler =(requesthandler)=>{
    (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}


export {asynchandler}