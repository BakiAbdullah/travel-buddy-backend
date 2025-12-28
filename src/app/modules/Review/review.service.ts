import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/user";
import { prisma } from "../../../shared/prismaInstance";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";

export const createReviewIntoDB = async (user: IAuthUser, payload: any) => {
  const { travelPlanId, targetUserId, rating, comment } = payload;

  if (!travelPlanId || !targetUserId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing travelPlanId or targetUserId"
    );
  }

  // Logged-in user (plan owner)
  const reviewer = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // Travel plan with owner and travelRequests
  const travelPlan = await prisma.travelPlans.findUniqueOrThrow({
    where: { id: travelPlanId },
    include: { user: true, travelRequests: true },
  });

  // Only plan owner can give reviews
  if (reviewer.id !== travelPlan.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only review buddies for your own trip!"
    );
  }

  // Find the buddy in accepted travel requests
  const acceptedBuddy = travelPlan.travelRequests.find(
    (r) =>
      r.requesterId === targetUserId &&
      (r.status ?? "").toUpperCase() === "ACCEPTED"
  );

  if (!acceptedBuddy) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review buddies who joined this trip!"
    );
  }

  // Validate rating
  const ratingFloat = parseFloat(rating);
  if (isNaN(ratingFloat) || ratingFloat < 1 || ratingFloat > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid rating value!");
  }

  // Transaction: create review and update average rating
  return await prisma.$transaction(async (tx) => {
    const alreadyReviewed = await prisma.review.findFirst({
      where: {
        travelPlanId,
        reviewerId: reviewer.id,
        reviewedId: targetUserId,
      },
    });

    if (alreadyReviewed) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You already reviewed this buddy for this trip!"
      );
    }
    const createdReview = await tx.review.create({
      data: {
        travelPlanId,
        reviewerId: reviewer.id,
        reviewedId: targetUserId,
        rating: ratingFloat,
        comment,
      },
    });

    // Update average rating for reviewed user
    const avg = await tx.review.aggregate({
      where: { reviewedId: targetUserId },
      _avg: { rating: true },
    });

    await tx.user.update({
      where: { id: targetUserId },
      data: { rating: avg._avg.rating || 0 },
    });

    return createdReview;
  });
};

const getAllFromDB = async (filters: any, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm } = filters;
  const andConditions: Prisma.ReviewWhereInput[] = [];

  // Add search functionality if needed
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          comment: {
            contains: searchTerm,
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
        {
          reviewer: {
            name: {
              contains: searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
        {
          reviewed: {
            name: {
              contains: searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            rating: "desc", // Default sort by rating descending for testimonials
          },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          rating: true,
        },
      },
      reviewed: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          rating: true,
        },
      },
      travelPlan: {
        select: {
          id: true,
          destination: true,
          destinationImages: true,
          startDateTime: true,
          endDateTime: true,
          itinerary: true,
        },
      },
    },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// Get testimonials - high-rated reviews for frontend testimonial section
const getTestimonialsFromDB = async () => {
  const result = await prisma.review.findMany({
    where: {
      rating: {
        gte: 4.0,
      },
      comment: {
        not: null,
      },
    },
    orderBy: {
      rating: "desc",
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          rating: true,
        },
      },
      reviewed: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          rating: true,
        },
      },
      travelPlan: {
        select: {
          id: true,
          destination: true,
          destinationImages: true,
          startDateTime: true,
          endDateTime: true,
        },
      },
    },
  });

  return {
    meta: {
      total: result.length,
    },
    data: result,
  };
};
export const ReviewService = {
  createReviewIntoDB,
  getAllFromDB,
  getTestimonialsFromDB,
};
