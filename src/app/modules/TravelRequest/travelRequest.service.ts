import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/user";
import { prisma } from "../../../shared/prismaInstance";
import { RequestStatus } from "@prisma/client";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";

const createJoinRequestToUser = async (
  requesterId: string,
  planId: string,
) => {
  // fetch plan with owner
  const plan = await prisma.travelPlans.findUnique({
    where: { id: planId },
    include: { user: true }, // plan owner
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found");
  }

  if (plan.userId === requesterId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot request to join your own plan"
    );
  }

  // If you want to restrict PRIVATE plans
  if (plan.visibility === "PRIVATE") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This plan is private");
  }

  // Prevent duplicate PENDING request
  const existing = await prisma.travelRequest.findFirst({
    where: {
      planId,
      requesterId,
      status: RequestStatus.PENDING,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already have a pending request for this plan"
    );
  }

  // Create travel request linking requester and receiver (plan owner)
  const travelRequest = await prisma.travelRequest.create({
    data: {
      planId,
      requesterId,
      receiverId: plan.userId,
      status: RequestStatus.PENDING,
    },
    include: {
      requester: {
        select: { id: true, name: true, email: true, profileImage: true },
      },
      receiver: {
        select: { id: true, name: true, email: true, profileImage: true },
      },
      plan: {
        select: { id: true, destination: true, userId: true },
      },
    },
  });

  // TODO: notify plan owner (push/email/socket) outside of DB transaction

  return travelRequest;
};

/**
 * respondToRequest - owner accepts or rejects a request
 */
export const respondToRequest = async (
  userId: string,
  requestId: string,
  status: "ACCEPTED" | "REJECTED"
) => {
  // fetch request with plan
  const request = await prisma.travelRequest.findUnique({
    where: { id: requestId },
    include: { plan: true },
  });

  if (!request)
      throw new ApiError(httpStatus.NOT_FOUND, "Request not found");;
  if (request.plan.userId !== userId)
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
  if (request.status !== RequestStatus.PENDING)
    return {
      status: 400,
      success: false,
      message: "Request already processed",
    };

  const updated = await prisma.$transaction(async (tx) => {
    const updatedReq = await tx.travelRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, destination: true, userId: true } },
      },
    });

    return updatedReq;
  });

  // TODO: send notification to requester about status (outside tx)

  return {
    status: 200,
    success: true,
    message: `Request ${status.toLowerCase()}`,
    data: updated,
  };
};

/**
 * getRequestsByUser - requests made by the current user
 */
export const getAllRequestsByUser = async (
  requesterId: string,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const [result, total] = await prisma.$transaction([
    prisma.travelRequest.findMany({
      where: { requesterId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        plan: {
          select: {
            id: true,
            destination: true,
            startDateTime: true,
            endDateTime: true,
            userId: true,
          },
        },
        requester: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
      },
    }),
    prisma.travelRequest.count({ where: { requesterId } }),
  ]);

  return {
    data: result,
    meta: { total, page, limit },
  };
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

export const TravelRequestService = {
  createJoinRequestToUser,
  respondToRequest,
  getAllRequestsByUser,
};
