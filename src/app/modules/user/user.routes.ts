import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import { fileUploaderUtils } from "../../../helpers/fileUploader";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";


const router = express.Router();

router.get("/", userController.getAllUsersFromDB);

router.get("/:id", userController.getSingleUserFromDB);

/**
 * Soft Delete User id
 */
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  userController.softDeleteUser
);



router.post(
  "/create-admin",
  checkAuth(UserRole.ADMIN),
  fileUploaderUtils.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data));
    return userController.createAdmin(req, res, next);
  }
);

router.post(
  "/register",
  fileUploaderUtils.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createUser.parse(JSON.parse(req.body.data));
    return userController.createUser(req, res, next);
  }
);

/**
 * Update User by id (Working...)
 */
router.patch(
  "/update/:id",
  checkAuth(UserRole.ADMIN),
  userController.updateUserById
);

router.patch(
  "/me/update",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  fileUploaderUtils.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    return userController.updateMyProfie(req, res, next);
  }
);


export const userRoutes = router;
