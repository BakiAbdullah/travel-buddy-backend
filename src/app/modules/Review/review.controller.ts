import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { IAuthUser } from "../../interfaces/user";
import pickQuery from "../../../shared/pickQuery";


const createReviewIntoDB = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.createReviewIntoDB(
      user as IAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pickQuery(req.query, [
      "searchTerm",
    ]);
    const options = pickQuery(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewService.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getTestimonialsFromDB = catchAsync(async (req: Request, res: Response) => {
    
    const result = await ReviewService.getTestimonialsFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Testimonials retrieved successfully',
        data: result.data,
    });
});


export const ReviewController = {
  createReviewIntoDB,
  getAllFromDB,
  getTestimonialsFromDB
};