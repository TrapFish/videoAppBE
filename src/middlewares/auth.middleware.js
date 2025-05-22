import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from "../utils/asyncHandlers.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyUserJWT = asyncHandler(async (req, res, next) => {
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
     
        const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       
        const user = await User.findById(decodedTokenInfo?._id).select("-password -refreshToken");
       
        if (!user) {
            throw new ApiError(401, "Invalid acess token");
        }
        console.log("user", user);
        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, "Unauthorized request Samjhe", err?.message || "Invalid access token");
    }
})