import { UserRole } from "@prisma/client";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { RequestController } from "./travelRequest.controller";

const router = express.Router();

// Create Travel Request
router.post(
  "/:planId/requests",
  checkAuth(UserRole.USER),
  RequestController.createJoinRequestToUser
);

// Accept or Reject Request
router.patch(
  "/:requestId",
  checkAuth(UserRole.USER),
  RequestController.respondToRequest
);


router.get(
  "/users/requests",
  checkAuth(UserRole.USER),
  RequestController.getAllRequestsByUser
);

export const TravelRequest = router;
