import express from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
// import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  AuthController.getMyProfile
);

router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/reset-password", AuthController.resetPassword);

// router.post(
//   "/change-password",
//   // auth(UserRole.ADMIN, UserRole.USER),
//   AuthController.changePassword
// );

// router.post("/forgot-password", AuthController.forgotPassword);

export const AuthRoutes = router;
