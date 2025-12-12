import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/user";
import pickQuery from "../../../shared/pickQuery";
import { TravelPlanService } from "./travel.service";

const createTravelPlansIntoDB = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userId = req.user?.id;

    const result = await TravelPlanService.createTravelPlansIntoDB(
      userId as string,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plans created successfully!",
      data: result,
    });
  }
);

const getAllTravelPlans = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filters = pickQuery(req.query, [
      "searchTerm",
      "startDateTime",
      "endDateTime",
      "destination",
      "itinerary",
      "travelType",
      "visibility",
    ]);
    const options = pickQuery(req.query, [
      "limit",
      "page",
      "sortBy",
      "sortOrder",
    ]);

    const result = await TravelPlanService.getAllTravelPlans(filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Travel Plans retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

/**
 * Get Matched Travelers
 */

const getMatchedTravelersForLoggedInUser = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const currentUserId = req.user?.id;

    const filters = pickQuery(req.query, [
      "searchTerm",
      "startDateTime",
      "endDateTime",
      "destination",
      "itinerary",
      "travelType",
      "visibility",
    ]);

    // const options = pickQuery(req.query, [
    //   "limit",
    //   "page",
    //   "sortBy",
    //   "sortOrder",
    // ]);

    const result = await TravelPlanService.getMatchedTravelersForLoggedInUser(
      currentUserId!,
      filters,
      // options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Matched travelers based on your travel plans!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateTravelPlanById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    // const user = req.user;
    const { id } = req.params;

    const result = await TravelPlanService.updateTravelPlanById(
      id,
      // user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plans updated successfully!",
      data: result,
    });
  }
);

// Get My Travel Plans
const getMyTravelPlans = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
      const filters = pickQuery(req.query, [
        "searchTerm",
        "startDateTime",
        "endDateTime",
        "destination",
        "itinerary",
        "travelType",
        "visibility",
        "isCompleted"
      ]);
    const options = pickQuery(req.query, [
      "limit",
      "page",
      "sortBy",
      "sortOrder",
    ]);

    const result = await TravelPlanService.getMyTravelPlans(user as IAuthUser, filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My travel plans data fetched!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TravelPlanService.getTravelPlanById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel Plan retrieval successfull!",
    data: result,
  });
});

const deleteTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TravelPlanService.deleteTravelPlanById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel Plan deletion successfull!",
    data: result,
  });
});

export const TravelPlanController = {
  createTravelPlansIntoDB,
  getAllTravelPlans,
  getMatchedTravelersForLoggedInUser,
  updateTravelPlanById,
  getTravelPlanById,
  deleteTravelPlanById,
  getMyTravelPlans,
};
