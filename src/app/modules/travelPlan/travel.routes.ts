import { UserRole } from "@prisma/client";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { TravelPlanController } from "./travel.controller";

const router = express.Router();

router.get(
  "/my-plans",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  TravelPlanController.getMyTravelPlans
);

// Get Recommended / getMatchedTravelPlans Travel Plan for user

router.get(
  "/match",
  checkAuth(UserRole.USER),
  TravelPlanController.getMatchedTravelersForLoggedInUser 
);

/**
 * Get All Travel Plans for Admin 
 */ 
router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  TravelPlanController.getAllTravelPlans
);

router.post(
  "/create-travel-plan",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  TravelPlanController.createTravelPlansIntoDB
);

/**
 * Update Travel Plans by id
 */
router.patch(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  TravelPlanController.updateTravelPlanById
);

/**
 * Get Travel Plans by id
 */
router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  TravelPlanController.getTravelPlanById
);

/**
 * Delete Travel Plans by id
 */
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  TravelPlanController.deleteTravelPlanById
);

export const TravelPlanRoutes = router;
