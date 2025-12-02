import { prisma } from "../../../shared/prismaInstance";
import { TravelPlans } from "@prisma/client";
import { ITravelPlan } from "./travel.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { convertDateTime } from "../../../helpers/dateConverter";

const createTravelPlansIntoDB = async (
  userId: string,
  payload: ITravelPlan
): Promise<TravelPlans[]> => {
  // Validate dates
  // 2026-10-10T10:00
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

export const TravelPlanService = {
  createTravelPlansIntoDB,
};
