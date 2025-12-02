import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../../shared/prismaInstance";
import { jwtHelpers } from "../../../helpers/jwtHelpers";

const login = async (credentials: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: credentials?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect!!");
  }

  // Now if all ok => we will generate jwt access & refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: user.email,
      role: user.role,
    },
    config.jwt_vars.access_token_secret as string,
    config.jwt_vars.access_expires_in as string
  );

  // Generate Refresh token
  const refreshToken = jwtHelpers.generateToken(
    {
      email: user.email,
      role: user.role,
    },
    config.jwt_vars.refresh_token_secret as string,
    config.jwt_vars.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

// const refreshToken = async (token: string) => {
//   let decodedData;
//   try {
//     decodedData = jwtHelper.verifyToken(
//       token,
//       config.jwt_vars.refresh_token_secret as Secret
//     );
//   } catch (err) {
//     throw new Error("You are not authorized!");
//   }

//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: decodedData.email,
//       status: UserStatus.ACTIVE,
//     },
//   });

//   const accessToken = jwtHelper.generateToken(
//     {
//       email: userData.email,
//       role: userData.role,
//     },
//     config.jwt_vars.access_token_secret as Secret,
//     config.jwt_vars.access_expires_in as string
//   );

//   const refreshToken = jwtHelper.generateToken(
//     {
//       email: userData.email,
//       role: userData.role,
//     },
//     config.jwt_vars.refresh_token_secret as Secret,
//     config.jwt_vars.refresh_expires_in as string
//   );

//   return {
//     accessToken,
//     refreshToken,
//     needPasswordChange: userData.needPasswordChange,
//   };
// };



// const getMe = async (user: any) => {
//   const accessToken = user.accessToken;
//   const decodedData = jwtHelper.verifyToken(
//     accessToken,
//     config.jwt_vars.access_token_secret as Secret
//   );

//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: decodedData.email,
//       status: UserStatus.ACTIVE,
//     },
//     select: {
//       id: true,
//       email: true,
//       role: true,
//       needPasswordChange: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//       admin: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//           contactNumber: true,
//           isDeleted: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//       doctor: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//           contactNumber: true,
//           address: true,
//           registrationNumber: true,
//           experience: true,
//           gender: true,
//           appointmentFee: true,
//           qualification: true,
//           currentWorkingPlace: true,
//           designation: true,
//           averageRating: true,
//           isDeleted: true,
//           createdAt: true,
//           updatedAt: true,
//           doctorSpecialities: {
//             include: {
//               specialities: true,
//             },
//           },
//         },
//       },
//       patient: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           profilePhoto: true,
//           // contactNumber: true,
//           address: true,
//           isDeleted: true,
//           createdAt: true,
//           updatedAt: true,
//           patientHealthData: true,
//         },
//       },
//     },
//   });

//   return userData;
// };

export const AuthServices = {
  login,
  // refreshToken,
};
