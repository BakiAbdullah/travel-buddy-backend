import { Request, Response } from "express";

import { AuthServices } from "./auth.services";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/user";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);

  const { accessToken, refreshToken, needPasswordChange } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User logged in successfully!",
    data: {
      needPasswordChange,
    },
  });
});

// Get My Profile
const getMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await AuthServices.getMyProfile(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile data fetched!",
      data: result,
    });
  }
);

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthServices.refreshToken(refreshToken);
  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token genereated successfully!",
    data: {
      message: "Access token genereated successfully!",
    },
  });
});

// const changePassword = catchAsync(
//   async (req: Request & { user?: any }, res: Response) => {
//     const user = req.user;

//     const result = await AuthServices.changePassword(user, req.body);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Password Changed successfully",
//       data: result,
//     });
//   }
// );

// const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   await AuthServices.forgotPassword(req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Check your email!",
//     data: null,
//   });
// });

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});

// const getMe = catchAsync(async (req: Request, res: Response) => {
//   const userSession = req.cookies;
//   const result = await AuthServices.getMe(userSession);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User retrive successfully!",
//     data: result,
//   });
// });

export const AuthController = {
  login,
  getMyProfile,
  refreshToken,
  resetPassword,
  // changePassword,
  // forgotPassword,
  // getMe,
};
