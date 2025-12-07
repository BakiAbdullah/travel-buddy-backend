import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/user";
import { prisma } from "../../../shared/prismaInstance";

const createReviewIntoDB = async (user: IAuthUser, payload: any) => {
  // Find Reviewer
  const reviewer = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  console.log({ reviewer });

  const travelPlan = await prisma.travelPlans.findUniqueOrThrow({
    where: {
      id: payload.travelPlanId,
    },
  });

  console.log({ travelPlan });

  // You cannot review your own trip
  if (reviewer.id === travelPlan.userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your trip!");
  }

  // Convert rating to float
  const ratingFloat = parseFloat(payload.rating);
  if (isNaN(ratingFloat)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid rating value!");
  }

  return await prisma.$transaction(async (tnx) => {
    const createdReview = await tnx.review.create({
      data: {
        travelPlanId: payload.travelPlanId,
        reviewerId: reviewer.id,
        reviewedId: travelPlan.userId,
        rating: ratingFloat,
        comment: payload.comment,
      },
    });

    console.log({ createdReview });

    // Calculate Average Rating
    const avg = await tnx.review.aggregate({
      where: {
        reviewedId: travelPlan.userId,
      },
      _avg: {
        rating: true,
      },
    });

    const newAverageRating = avg._avg.rating || 0;

    // Update reviewed user's profile rating
    await tnx.user.update({
      where: {
        id: travelPlan.userId,
      },
      data: {
        rating: newAverageRating,
      },
    });

    return createdReview;
  });
};

// const getAllFromDB = async (
//     filters: any,
//     options: IPaginationOptions,
// ) => {
//     const { limit, page, skip } = paginationHelper.calculatePagination(options);
//     const { patientEmail, doctorEmail } = filters;
//     const andConditions = [];

//     if (patientEmail) {
//         andConditions.push({
//             patient: {
//                 email: patientEmail
//             }
//         })
//     }

//     if (doctorEmail) {
//         andConditions.push({
//             doctor: {
//                 email: doctorEmail
//             }
//         })
//     }

//     const whereConditions: Prisma.ReviewWhereInput =
//         andConditions.length > 0 ? { AND: andConditions } : {};

//     const result = await prisma.review.findMany({
//         where: whereConditions,
//         skip,
//         take: limit,
//         orderBy:
//             options.sortBy && options.sortOrder
//                 ? { [options.sortBy]: options.sortOrder }
//                 : {
//                     createdAt: 'desc',
//                 },
//         include: {
//             doctor: true,
//             patient: true,
//             //appointment: true,
//         },
//     });
//     const total = await prisma.review.count({
//         where: whereConditions,
//     });

//     return {
//         meta: {
//             total,
//             page,
//             limit,
//         },
//         data: result,
//     };
// };

export const ReviewService = {
  createReviewIntoDB,
  //   getAllFromDB,
};
