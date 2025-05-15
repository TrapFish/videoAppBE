import { asyncHandler } from '../utils/asyncHandlers.js';
import { ApiError } from '../utils/ApiError.js';
import  User  from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/Cloudnary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    console.log("Register User ", req.body, req.files);

    // will get the data from request body
    // validation of the data
    // check user already exists or not : useName and email
    // avatar is required , check is required
    // upload to them on cloudinary - get the url , avatar
    // create user object - create entery in db
    // remove password and refresh token fields from the user object
    //check for user creation 
    // return response
    // will generate the token and once got the token will send the response to the client in cookie

    let { userName, email, fullName, password } = req.body;
    console.log("Email ", email, userName, fullName, password);

    if ([userName, email, fullName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
   const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });
    console.log("Existed User ", existedUser);
    if(existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }
    console.log("Files 32", req.files);
    const avatarLocalPath = await req.files?.avatar[0]?.path;
    //const coverImageLocalPath = await req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = await req.files?.coverImage[0]?.path; 

    }
    console.log("Avatar Local Path ", avatarLocalPath, coverImageLocalPath);
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar) {
        throw new ApiError(500, "Error uploading avatar to cloudinary");
    }
   const user = await User.create({
        userName: userName?.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar?.url,
        coverImage: coverImage ? coverImage?.url : '',
    });

   const createdUser = await User.findById(user._id).select("-password -refreshToken");
   if(!createdUser){
     throw  new ApiError(500, "Error creating user in db");
   }

   return res.status(200).json(new ApiResponse(200, createdUser ,"User created successfully"));

});

export { registerUser };