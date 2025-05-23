import { asyncHandler } from '../utils/asyncHandlers.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/Cloudnary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
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

    if ([userName, email, fullName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatarLocalPath = await req.files?.avatar[0]?.path;
    //const coverImageLocalPath = await req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = await req.files?.coverImage[0]?.path;

    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
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
    if (!createdUser) {
        throw new ApiError(500, "Error creating user in db");
    }

    return res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"));

});

const loginUser = asyncHandler(async (req, res) => {
    // req.body to data
    // userName and email
    //find the user
    //check for password
    // access and refresh token
    //send in cookies with secure 
    // send the response that the user is logged in successfully
    const { userName, email, password } = req.body;
    if ([userName, email].some(field => field?.trim() === "")) {
        throw new ApiError(400, "Username or password are required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User doesn't esxist");
    }

    const isPassword = await user.isPassWordCorrect(password);
    if (!isPassword) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, refreshToken, accessToken }, "User logged in successfully"));

});

const logoutUser = asyncHandler(async (req, res) => {
    //clear cookies and clear refresh token
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    }
    );

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is required");
        }
        const decodedoken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedoken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (incomingRefreshToken !== user?.refresToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200, { accessToken, refresToken: newRefreshToken }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPassWordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(new ApiResponse(200, req.user, "current User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if ([fullName, email].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Error uploading avatar to cloudinary");
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar?.url
        }
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCovereImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.coverImage[0]?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(500, "Error uploading cover image to cloudinary");
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage?.url
        }
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "CoverImage updated successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCovereImage
};