import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";

export const checkAuth = (...roles: UserRole[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization || req.cookies.accessToken;

      // Case 1: Token not available
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Access denied! You are not authorized!"
        );
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt_vars.access_token_secret as Secret
      );

      // Attach user to request object
      req.user = verifiedUser;

      // Case 2: Not an admin role
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

