import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TravelRequestService } from "./travelRequest.service";
import { IAuthUser } from "../../interfaces/user";
import pickQuery from "../../../shared/pickQuery";


const createJoinRequestToUser = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const requesterId = req.user?.id;
    const { planId } = req.params;
    
    
    const result = await TravelRequestService.createJoinRequestToUser(
      requesterId as string,
      planId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel Request send successfully!",
      data: result,
    });
  }
);

/**
 * Response to travel Request
 */
const respondToRequest = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userId = req.user?.id;
     const { requestId } = req.params;
     const { status } = req.body as { status?: string };

    const result = await TravelRequestService.respondToRequest(
      userId as string,
      requestId,
      status as "ACCEPTED" | "REJECTED"
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel Request accepted!",
      data: result,
    });
  }
);


/**
 * Get Requests created by the User
 */
const getAllRequestsByUser = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const requesterId = req.user?.id;
    const options = pickQuery(req.query, [
      "limit",
      "page",
      "sortBy",
      "sortOrder",
    ]);
    const result = await TravelRequestService.getAllRequestsByUser(
      requesterId as string, options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel Requests retrieved!",
      meta: result.meta,
      data: result.data,
    });
  }
);

// const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
//     const filters = pick(req.query, reviewFilterableFields);
//     const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
//     const result = await ReviewService.getAllFromDB(filters, options);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: 'Reviews retrieval successfully',
//         meta: result.meta,
//         data: result.data,
//     });
// });


export const RequestController = {
  createJoinRequestToUser,
  respondToRequest,
  getAllRequestsByUser,
};