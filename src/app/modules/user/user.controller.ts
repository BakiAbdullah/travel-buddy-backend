import { Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/user";
import pickQuery from "../../../shared/pickQuery";
import { userFilterableFields } from "./user.constant";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Created successfuly!",
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.softDeleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Deleted successfuly!",
    data: result,
  });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Created successfuly!",
    data: result,
  });
});

// Update profile
const updateMyProfie = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await userService.updateMyProfie(user as IAuthUser, req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated!",
      data: result,
    });
  }
);

// Update User By Admin
const updateUserById = catchAsync(
  async (req: Request, res: Response) => {
    console.log("Update Profile By Admin Controller hit");
    const { id } = req.params;
    const result = await userService.updateUserById(
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plans updated successfully!",
      data: result,
    });
  }
);


// Get All Users
const getAllUsersFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pickQuery(req.query, userFilterableFields);
  const options = pickQuery(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);

  const result = await userService.getAllUsersFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users data fetched!",
    meta: result.meta,
    data: result.data,
  });
});

// GEt Single User
const getSingleUserFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await userService.getSingleUserFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile data retrieved!",
    data: result,
  });
});

// const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await userService.changeProfileStatus(id, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Users profile status changed!",
//     data: result,
//   });
// });

// const getMyProfile = catchAsync(
//   async (req: Request & { user?: IAuthUser }, res: Response) => {
//     const user = req.user;

//     const result = await userService.getMyProfile(user as IAuthUser);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "My profile data fetched!",
//       data: result,
//     });
//   }
// );

// const updateMyProfie = catchAsync(
//   async (req: Request & { user?: IAuthUser }, res: Response) => {
//     const user = req.user;

//     const result = await userService.updateMyProfie(user as IAuthUser, req);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "My profile updated!",
//       data: result,
//     });
//   }
// );

export const userController = {
  createAdmin,
  createUser,
  updateMyProfie,
  getAllUsersFromDB,
  getSingleUserFromDB,
  softDeleteUser,
  updateUserById,
};
