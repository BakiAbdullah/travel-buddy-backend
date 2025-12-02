import { UserRole } from '@prisma/client';
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { TravelPlanController } from './travel.controller';

const router = express.Router();

// router.get(
//     '/',
//     auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
//     ScheduleController.getAllFromDB
// );

// /**
//  * API ENDPOINT: /schedule/:id
//  * 
//  * Get schedule data by id
//  */
// router.get(
//     '/:id',
//     auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
//     ScheduleController.getByIdFromDB
// );

router.post(
  "/create-travel-plan",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  TravelPlanController.createTravelPlansIntoDB
);



// /**
//  * API ENDPOINT: /schdeule/:id
//  * 
//  * Delete schedule data by id
//  */
// router.delete(
//     '/:id',
//     auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//     ScheduleController.deleteFromDB
// );

export const TravelPlanRoutes = router;