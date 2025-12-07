import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../../shared/prismaInstance";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { IAuthUser } from "../../interfaces/user";
import { Secret } from "jsonwebtoken";

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
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_vars.access_token_secret as string,
    config.jwt_vars.access_expires_in as string
  );

  // Generate Refresh token
  const refreshToken = jwtHelpers.generateToken(
    {
      id: user.id,
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

// Get My Profile
const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      visitedCountries: true,
      currentLocation: true,
      bio: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.USER) {
    profileInfo = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        travelInterests: true,
        travelPlans: true,
        visitedCountries: true,
        reviewsGiven: true,
        reviewsReceived: true,
        rating: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } 

  return { ...userInfo, ...profileInfo };
};

// Refresh Token
const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt_vars.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt_vars.access_token_secret as Secret,
    config.jwt_vars.access_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt_vars.refresh_token_secret as Secret,
    config.jwt_vars.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt_vars.reset_pass_token_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
      needPasswordChange: false,
    },
  });
};



export const AuthServices = {
  login,
  getMyProfile,
  refreshToken,
  resetPassword,
};
