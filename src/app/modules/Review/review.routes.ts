import express from 'express'
import { ReviewController } from './review.controller';
import { UserRole } from '@prisma/client';
import { checkAuth } from '../../middlewares/checkAuth';

const router = express.Router();

// router.get('/', ReviewController.getAllFromDB);

router.post(
    '/',
    checkAuth(UserRole.USER),
    // validateRequest(ReviewValidation.create),
    ReviewController.createReviewIntoDB
);


export const ReviewRoutes = router;