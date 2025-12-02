import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/user";
import { prisma } from "../../../shared/prismaInstance";

const createReviewIntoDB = async (user: IAuthUser, payload: any) => {
  const reviewer = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  console.log({ reviewer });

  const travelData = await prisma.travelPlans.findUniqueOrThrow({
    where: {
      id: payload.travelPlanId,
    },
  });

  console.log({ travelData });

  // You cannot review your own trip
  if (reviewer.id === travelData.userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your trip!");
  }

  return await prisma.$transaction(async (tnx) => {
    const createdReview = await tnx.review.create({
      data: {
        travelPlanId: payload.travelPlanId,
        reviewerId: reviewer.id,
        reviewedId: travelData.userId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    console.log({ createdReview });

    const avg = await tnx.review.aggregate({
      where: {
        reviewedId: travelData.userId,
      }, // Calculate average rating for the reviewed user
      _avg: {
        rating: true,
      },
    });

    const newAvgRating = avg._avg.rating || 0;

    // 3️⃣ Update User Profile Rating (NOT REVIEW)
    await tnx.review.update({
      where: {
        id: travelData.userId,
      },
      data: {
        rating:  newAvgRating ,
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
