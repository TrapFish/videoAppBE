import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCovereImage,
    getUserChannelProfile,
    getWatchHistoryOfUser
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]), registerUser
);

router.route('/login').post(loginUser);

//Secured Routes
router.route('/logout').post(verifyUserJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyUserJWT, changeCurrentPassword);
router.route('/current-user').get(verifyUserJWT, getCurrentUser);
router.route('/update-account').patch(verifyUserJWT, updateAccountDetails);
router.route('/avatar').patch(verifyUserJWT, upload.single('avatar'), updateUserAvatar);
router.route('/cover-image').patch(verifyUserJWT, upload.single('/coverImage'), updateUserCovereImage);
router.route('/c/:userName').get(verifyUserJWT, getUserChannelProfile);
router.route('/history').get(verifyUserJWT, getWatchHistoryOfUser)

export default router;