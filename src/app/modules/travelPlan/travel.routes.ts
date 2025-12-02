import { UserRole } from "@prisma/client";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { TravelPlanController } from "./travel.controller";

const router = express.Router();

router.get(
  "/match",
  checkAuth(UserRole.ADMIN, UserRole.USER),
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
  checkAuth(UserRole.USER),
  TravelPlanController.updateTravelPlanById
);

/**
 * Get Travel Plans by id
 */
router.get(
  "/:id",
  checkAuth(UserRole.ADMIN),
  TravelPlanController.getTravelPlanById
);

/**
 * Delete Travel Plans by id
 */
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  TravelPlanController.deleteTravelPlanById
);

export const TravelPlanRoutes = router;
