import { prisma } from "../../../shared/prismaInstance";
import { Prisma, TravelPlans, UserStatus } from "@prisma/client";

import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { convertDateTime } from "../../../helpers/dateConverter";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { ITravelPlan } from "./travel.interface";
import {
  enumSearchFields,
  stringSearchFields,
  travelTypeEnumValues,
  visibilityEnumValues,
} from "./travel.constant";

const createTravelPlansIntoDB = async (
  userId: string,
  payload: ITravelPlan
): Promise<TravelPlans[]> => {
  // Validate dates
  const startTime = convertDateTime(payload.startDateTime);
  const endTime = convertDateTime(payload.endDateTime);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid date format. Use ISO format: YYYY-MM-DDTHH:mm:ssZ"
    );
  }

  // Create Travel Plan
  const newTravelPlan = await prisma.travelPlans.create({
    data: {
      userId,
      destination: payload.destination,
      startDateTime: startTime,
      endDateTime: endTime,
      budgetRange: payload.budgetRange,
      travelType: payload.travelType ?? "SOLO",
      itinerary: payload.itinerary,
      visibility: payload.visibility ?? "PUBLIC",
    },
  });

  return [newTravelPlan];
};

const getAllTravelPlans = async (filters: any, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.TravelPlansWhereInput[] = [];

  /* --------------------------
     1. searchTerm Filtering
  --------------------------- */
  if (searchTerm && typeof searchTerm === "string") {
    const orConditions: Prisma.TravelPlansWhereInput[] = [];

    // String fields (case-insensitive exact match)
    stringSearchFields.forEach((field) => {
      orConditions.push({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      });
    });

    // Enum fields (only if valid)
    enumSearchFields.forEach((field) => {
      let matchedValue: string | undefined;

      if (field === "travelType") {
        matchedValue = travelTypeEnumValues.find(
          (val) => val.toLowerCase() === searchTerm.toLowerCase()
        );
      } else if (field === "visibility") {
        matchedValue = visibilityEnumValues.find(
          (val) => val.toLowerCase() === searchTerm.toLowerCase()
        );
      }

      if (matchedValue) {
        orConditions.push({ [field]: matchedValue });
      }
    });

    if (orConditions.length) {
      andConditions.push({ OR: orConditions });
    }
  }

  // Exact filtering for other fields
  Object.entries(filterData).forEach(([key, value]) => {
    if (!value) return;

    if (enumSearchFields.includes(key)) {
      let matchedValue: string | undefined;

      if (key === "travelType") {
        matchedValue = travelTypeEnumValues.find(
          (val) => val.toLowerCase() === (value as string).toLowerCase()
        );
      } else if (key === "visibility") {
        matchedValue = visibilityEnumValues.find(
          (val) => val.toLowerCase() === (value as string).toLowerCase()
        );
      }

      if (matchedValue) andConditions.push({ [key]: matchedValue });
    } else {
      andConditions.push({
        [key]: {
          contains: value,
          mode: "insensitive", // case-insensitive
        },
      });
    }
  });

  // Combine conditions
  const whereConditions: Prisma.TravelPlansWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Fetch data
  const result = await prisma.travelPlans.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      user: true,
      travelRequests: true,
    },
  });

  // Count total
  const total = await prisma.travelPlans.count({
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

// Update Travel Plan by ID
const updateTravelPlanById = async (
  id: string,
  payload: Partial<ITravelPlan>
) => {
  const isPlanExist = await prisma.travelPlans.findUnique({
    where: {
      id: id,
    },
  });

  if (!isPlanExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel Plan not found");
  }

  const updatedTravelPlan = await prisma.travelPlans.update({
    where: {
      id: id,
    },
    data: payload as Prisma.TravelPlansUpdateInput,
  });

  return updatedTravelPlan;
};

const getTravelPlanById = async (id: string) => {
  const travelPlan = await prisma.travelPlans.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return travelPlan;
};

const deleteTravelPlanById = async (id: string) => {
  const travelPlan = await prisma.travelPlans.delete({
    where: {
      id,
    },
  });
  return travelPlan;
};

export const TravelPlanService = {
  createTravelPlansIntoDB,
  getAllTravelPlans,
  getTravelPlanById,
  deleteTravelPlanById,
  updateTravelPlanById,
};
