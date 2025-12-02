import express from "express";
import { userRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { TravelPlanRoutes } from "../modules/travelPlan/travel.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/travel-plans",
    route: TravelPlanRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
