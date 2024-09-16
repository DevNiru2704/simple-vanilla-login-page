import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens!");
    }
}

const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    if ([firstName, lastName, username, email, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required!!");
    }

    const existingUsernameOrEmail = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUsernameOrEmail) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        firstName,
        lastName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdUser, "User registered successfully!!"));
})

const loginUser = asyncHandler(async (req, res) => {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier) {
        throw new ApiError(400, "Username or email is required!");
    }

    // Find user by either username or email
    const user = await User.findOne({
        $or: [{ username: loginIdentifier.toLowerCase() }, { email: loginIdentifier.toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(404, "User is not registered!!");
    }

    const validatePassword = await user.isPasswordCorrect(password);

    if (!validatePassword) {
        throw new ApiError(401, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User is logged in successfully!!"));
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,  
        { $unset: { refreshToken: 1 } },  // Unset the refreshToken field
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options) 
        .json(new ApiResponse(200, {}, "User logged out successfully!"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used!!");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {}, "Refresh Token is refreshed successfully!!"));
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid Refresh Token!!");
    }
})

export default {
    register,
    loginUser,
    logoutUser,
    refreshAccessToken
}
