import { TravelType, VisibilityType } from "@prisma/client";

export type ITravelPlan = {
    startDateTime: string;
    endDateTime: string;
    destination: string;
    budgetRange?: string;
    travelType?: TravelType;
    itinerary?: string;
    visibility?: VisibilityType
}

export type IFilterRequest = {
    startDate?: string | undefined;
    endDate?: string | undefined;
}