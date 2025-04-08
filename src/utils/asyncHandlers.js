 const asyncHandler = (requestHandler)=>{
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=>{ next(err)})
    }
 }



// }

// const asyncHandler = (fn) => async(req, res, next) =>{
//         try {
            
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 error: error.message,
//                 message: error.message,
//                 success: false
//             });
//         }
// }


export {asyncHandler}