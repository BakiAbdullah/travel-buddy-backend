import express from "express";
import { userRoutes } from "../modules/User/user.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { TravelPlanRoutes } from "../modules/TravelPlan/travel.routes";
import { ReviewRoutes } from "../modules/Review/review.routes";
import { TravelRequest } from "../modules/TravelRequest/travelRequest.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/travel-plans",
    route: TravelPlanRoutes,
  },
  {
    path: "/travel-request",
    route: TravelRequest,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
